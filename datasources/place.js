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
    return data.status === 'OK' && data.result !== {} ? data.result.opening_hours.open_now : null;
  }

  async getPhotoUrls(placeid) {
    const photos = await this.get('details/json', {
      fields: 'photo',
      placeid: placeid,
    }).then(res => res.result.photos);

    return await Promise.all(photos.map(async photo => await fetch(
        `${this.baseURL}/photo?maxwidth=175&maxheight=104&key=${this.context.apiKey}&photoreference=${photo.photo_reference}`
      ).then(res => res.url)
    ));
  }

  async getTags() {
    return await this.db.tag.find();
  }

  async getRestaurants() {
    return await this.db.restaurant.find().populate('tags');
  }

  async getRestaurant(placeid) {
    return await this.db.restaurant.findOne({ placeId: placeid }).populate('tags');
  }

  async searchRestaurants(tagIds) {
    return await this.db.restaurant.find({ tags: { $in: tagIds } }).sort('-rating').populate('tags');
    // tagIds = tagIds.map(tagId => o)
    // const r = await this.db.restaurant.aggregate([
    //   { $match: { "tags._id": { $in: tagIds } } },
    //   // { $addFields: { 'numSameTag': {$size: { "$setIntersection": ["$tags._id", tagIds] }} }},
    // ]);
    // console.log(r)
  }
}

module.exports = PlaceAPI;
