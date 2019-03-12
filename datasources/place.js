const { RESTDataSource } = require('apollo-datasource-rest');

const ObjectId = require('mongoose').Types.ObjectId;
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

  async getReviews(placeId) {
    const data = await this.get('details/json', {
      fields: 'review',
      placeid: placeId,
    });
    return data.status === 'OK' && Object.keys(data.result).length ? data.result.reviews.map(r => this.reviewReducer(r)) : [];
  }

  async isOpen(placeId) {
    const data = await this.get('details/json', {
      fields: 'opening_hours/open_now',
      placeid: placeId,
    });
    return data.status === 'OK' && Object.keys(data.result).length ? data.result.opening_hours.open_now : null;
  }

  async getPhotoUrls(placeId, photoUrls) {
    if (photoUrls)
      return photoUrls.slice(0, 5);

    /*
    const photos = await this.get('details/json', {
      fields: 'photo',
      placeid: placeId,
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
    */
  }

  async getTags() {
    return await this.db.tag.find();
  }

  async allRestaurants() {
    return await this.db.restaurant.find().sort('-rating').populate('tags');
  }

  async getRestaurants(placeIds) {
    return await this.db.restaurant.find({ placeId: { $in: placeIds }}).populate('tags');
  }

  async searchRestaurants(tagIds, lat, lng, orderBy) {
    tagIds = tagIds.map(tagId => ObjectId(tagId));

    const minReviewCount = 10;
    const sortParams = orderBy === 'distance' ?
    { 'commonTagCount': -1 } :
    { 'commonTagCount': -1, 'rating': -1, 'reviewCount': -1 };

    const r = await this.db.restaurant.aggregate(
      [
        {
          $geoNear: {
            near: [lng, lat],
            distanceField: "distance",
            distanceMultiplier: 6371,    // radius of the Earth
            num: 10000,     // should lager than collections count
            spherical: true,
            key: "location",
          }
        },
        {
          $match: {
            occasions: tagIds[0],
            reviewCount: { $gt: minReviewCount }
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
        { $sort: sortParams },
      ]
    );

    return await this.db.tag.populate(r, { path: 'tags' });
  }
}

module.exports = PlaceAPI;
