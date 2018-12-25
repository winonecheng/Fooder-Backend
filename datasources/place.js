const { RESTDataSource } = require('apollo-datasource-rest');

const fetch = require("node-fetch");

class PlaceAPI extends RESTDataSource {
  constructor(db) {
    super();
    this.db = db;
    this.baseURL = 'https://maps.googleapis.com/maps/api/place';
  }

  willSendRequest(request) {
    request.params.set('key', this.context.apiKey);
    request.params.set('language', 'zh-TW');
  }

  reviewReducer(review) {
    return {
      authorName: review.author_name,
      authorPhotoUrl: review.profile_photo_url,
      relativeTime: review.relative_time_description,
      rating: review.rating,
      text: review.text,
    };
  }

  async getReviews(placeid) {
    const data = await this.get('details/json', {
      fields: 'review',
      placeid: placeid,
    });
    return data.status === 'OK' && data.result !== {} ? data.result.reviews.map(r => this.reviewReducer(r)) : [];
  }

  async isOpen(placeid) {
    const data = await this.get('details/json', {
      fields: 'opening_hours/open_now',
      placeid: placeid,
    });
    return data.status === 'OK' && data.result !== {} && data.result.opening_hours ? data.result.opening_hours.open_now : null;
  }

  async getPhotoUrls(placeid) {
    const photos = await this.get('details/json', {
      fields: 'photo',
      placeid: placeid,
    }).then(res => res.result.photos);

    return photos ?
      await Promise.all(photos.map(async photo => await fetch(
        `${this.baseURL}/photo?maxwidth=374&maxheight=213&key=${this.context.apiKey}&photoreference=${photo.photo_reference}`
      ).then(res => res.url)
      )) : [];
  }

  async getTags() {
    return await this.db.tag.find();
  }

  async getRestaurants(first) {
    return await this.db.restaurant.find().sort('-rating').limit(first).populate('tags');
  }

  async getRestaurant(placeid) {
    return await this.db.restaurant.findOne({ placeId: placeid }).populate('tags');
  }

  async searchRestaurants(tagIds, first) {
    const ObjectId = require('mongoose').Types.ObjectId;
    tagIds = tagIds.map(tagId => ObjectId(tagId));

    const r = await this.db.restaurant.aggregate(
      [
        {
          $match: {
            occasions: tagIds[0],
            tags: { $in: tagIds.slice(1) },
          }
        },
        {
          $addFields: {
            'commonTagCount': {
              $size: {
                $setIntersection: ['$tags', tagIds.slice(1)]
              }
            }
          }
        },
        { $sort: { 'commonTagCount': -1 , 'rating': -1} },
        { $limit: first },
      ]
    );

    return await this.db.tag.populate(r, { path: 'tags' });
  }
}

module.exports = PlaceAPI;
