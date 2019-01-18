const { RESTDataSource } = require('apollo-datasource-rest');

const fetch = require("node-fetch");

const { calDistance } = require('../utils');

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
    return data.status === 'OK' && Object.keys(data.result).length ? data.result.reviews.map(r => this.reviewReducer(r)) : [];
  }

  async isOpen(placeid) {
    const data = await this.get('details/json', {
      fields: 'opening_hours/open_now',
      placeid: placeid,
    });
    return data.status === 'OK' && Object.keys(data.result).length ? data.result.opening_hours.open_now : null;
  }

  async getPhotoUrls(placeid, photoUrls) {
    const photoLimit = 5;
    if (photoUrls && photoUrls.length >= photoLimit)
      return photoUrls.slice(0, 5);

    const photos = await this.get('details/json', {
      fields: 'photo',
      placeid: placeid,
    })
      .then(res => res.result ? res.result.photos : null)
      .catch(err => console.error(err));

    return photos ?
      await Promise.all(photos.slice(0, photoLimit).map(
        async photo => await fetch(
          `${this.baseURL}/photo?maxwidth=374&maxheight=213&key=${this.context.apiKey}&photoreference=${photo.photo_reference}`
        )
          .then(res => res.url)
          .catch(err => console.error(err))
      ))
      : [];
  }

  async getTags() {
    return await this.db.tag.find();
  }

  async getRestaurants() {
    return await this.db.restaurant.find().sort('-rating').populate('tags');
  }

  async getRestaurant(placeid) {
    return await this.db.restaurant.findOne({ placeId: placeid }).populate('tags');
  }

  async searchRestaurants(tagIds) {
    const ObjectId = require('mongoose').Types.ObjectId;
    const reviewCountLimit = 10;

    tagIds = tagIds.map(tagId => ObjectId(tagId));

    if (tagIds.length === 1) {
      return await this.db.restaurant.find({
        occasions: tagIds[0],
        reviewCount: { $gt: reviewCountLimit }
      })
        .sort({ rating: -1, reviewCount: -1 })
        .populate('tags');
    }

    const r = await this.db.restaurant.aggregate(
      [
        {
          $match: {
            occasions: tagIds[0],
            tags: { $in: tagIds.slice(1) },
            reviewCount: { $gt: reviewCountLimit }
          }
        },
        {
          $addFields: {
            'id': { "$toString": "$_id" },
            'commonTagCount': {
              $size: {
                $setIntersection: ['$tags', tagIds.slice(1)]
              }
            }
          }
        },
        { $sort: { 'commonTagCount': -1, 'rating': -1, 'reviewCount': -1 } },
      ]
    );

    return await this.db.tag.populate(r, { path: 'tags' });
  }

  getDistance(location, info) {
    return calDistance(location.lat, location.lng, info.variableValues.lat, info.variableValues.lng);
  }
}

module.exports = PlaceAPI;
