const crypto = require('crypto');
const logger = require('heroku-logger')

const resolvers = {
  Query: {
    appEntry: (_, { user }) => {
      if (!user) user = crypto.randomBytes(20).toString('hex')
      logger.info('Open app', { action: 'entry', user: user });
      return { id: user }
    },
    tags: async (_, __, { dataSources }) => dataSources.placeAPI.getTags(),
    restaurants: async (_, { first = 10 }, { dataSources }) => dataSources.placeAPI.getRestaurants(first),
    searchRestaurants: async (_, { tagIds, first = 10, user }, { dataSources }) => {
      logger.info('Search restaurants', { action: 'search', tags: tagIds, user: user });
      return dataSources.placeAPI.searchRestaurants(tagIds, first);
    },
    getRestaurantByPlaceId: async (_, { placeId, user }, { dataSources }) => {
      logger.info('Get restaurant', { action: 'get', place: placeId, user: user });
      return dataSources.placeAPI.getRestaurant(placeId);
    },
  },
  Restaurant: {
    reviews: async (r, _, { dataSources }) => dataSources.placeAPI.getReviews(r.placeId),
    isOpenNow: async (r, _, { dataSources }) => dataSources.placeAPI.isOpen(r.placeId),
    photoUrls: async (r, _, { dataSources }) => dataSources.placeAPI.getPhotoUrls(r.placeId, r.photoUrls),
    distance: (r, _, { dataSources }, info) => dataSources.placeAPI.getDistance(r.location, info),
    id: (r) => r._id.toString(),
  }
};

module.exports = resolvers;
