const crypto = require('crypto');
const logger = require('heroku-logger')

const { paginateResults } = require('./utils');

const resolvers = {
  Query: {
    appEntry: (_, { user }) => {
      if (!user) user = crypto.randomBytes(20).toString('hex')
      logger.info('Open app', { action: 'entry', user: user });
      return { id: user }
    },
    tags: async (_, __, { dataSources }) => dataSources.placeAPI.getTags(),

    restaurants: async (_, { pageSize = 10, after, user }, { dataSources }) => {
      logger.info('Get all restaurants', { action: 'get', after: after, user: user });
      const allRestaurants = await dataSources.placeAPI.getRestaurants();

      const restaurants = paginateResults({
        after,
        pageSize,
        results: allRestaurants,
      });

      return {
        restaurants,
        cursor: restaurants.length
          ? restaurants[restaurants.length - 1].id
          : null,
        hasMore: restaurants.length
          ? restaurants[restaurants.length - 1].id !==
            allRestaurants[allRestaurants.length - 1].id
          : false,
      }
    },

    searchRestaurants: async (_, { tagIds, pageSize = 10, after, user }, { dataSources }) => {
      logger.info('Search restaurants', { action: 'search', tags: tagIds, after: after, user: user });
      const allRestaurants = await dataSources.placeAPI.searchRestaurants(tagIds);

      const restaurants = paginateResults({
        after,
        pageSize,
        results: allRestaurants,
      });

      return {
        restaurants,
        cursor: restaurants.length
          ? restaurants[restaurants.length - 1].id
          : null,
        hasMore: restaurants.length
          ? restaurants[restaurants.length - 1].id !==
            allRestaurants[allRestaurants.length - 1].id
          : false,
      }
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
  }
};

module.exports = resolvers;
