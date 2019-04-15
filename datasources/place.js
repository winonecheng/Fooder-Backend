const { RESTDataSource } = require('apollo-datasource-rest');

const ObjectId = require('mongoose').Types.ObjectId;
const fetch = require("node-fetch");

const { formatPrice } = require('../utils');

class PlaceAPI extends RESTDataSource {
  constructor(db) {
    super();
    this.db = db;
    this.baseURL = 'https://maps.googleapis.com/maps/api/place';
    this.geoNear = {
      near: null,
      distanceField: "distance",
      distanceMultiplier: 6371,    // radius of the Earth
      num: 10000,     // should lager than collections count
      spherical: true,
      key: "location",
    };
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
  }

  async getTags() {
    return await this.db.tag.find();
  }

  async allRestaurants() {
    return await this.db.restaurant.find().populate('tags');
  }

  async getRestaurant(placeId) {
    return await this.db.restaurant.findOne({ placeId: placeId }).populate('tags');
  }

  async getRestaurants(placeIds, lat, lng) {
    this.geoNear.near = [lng, lat];
    const r = await this.db.restaurant.aggregate(
      [
        { $geoNear: this.geoNear },
        { $match: { placeId: { $in: placeIds }}},
        { $addFields: {'id': { "$toString": "$_id" }}}
      ]
    );

    return await this.db.tag.populate(r, { path: 'tags' });
  }

  async searchRestaurants(tagIds, lat, lng, orderBy, priceLevel) {
    tagIds = tagIds.map(tagId => ObjectId(tagId));

    const minReviewCount = 10;
    const sort = orderBy === 'distance' ?
    { 'commonTagCount': -1 } :
    { 'commonTagCount': -1, 'rating': -1, 'reviewCount': -1 };
    var match = {
      occasions: tagIds[0],
      reviewCount: { $gt: minReviewCount },
    };
    if (priceLevel)
      match['priceLevel']= { $in: formatPrice(priceLevel) };

    this.geoNear.near = [lng, lat];

    const r = await this.db.restaurant.aggregate(
      [
        { $geoNear: this.geoNear },
        { $match: match },
        {
          $addFields: {
            'id': { "$toString": "$_id" },
            'commonTagCount': { $size: { $setIntersection: ['$tags', tagIds.slice(1)]}}
          }
        },
        { $sort: sort },
      ]
    );

    return await this.db.tag.populate(r, { path: 'tags' });
  }
}

module.exports = PlaceAPI;
