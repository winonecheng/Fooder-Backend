const crypto = require('crypto');
const logger = require('heroku-logger')

const { paginateResults } = require('./utils');

const resolvers = {
  Query: {
    appEntry: (_, { user }) => {
      if (!user)
        user = crypto.randomBytes(20).toString('hex')
      logger.info('Open app', { action: 'entry', user: user });
      return { id: user };
    },

    tags: async (_, __, { dataSources }) => dataSources.placeAPI.getTags(),

    restaurants: async (_, { pageSize = 10, after, user }, { dataSources }) => {
      logger.info('Get all restaurants', { action: 'get', after: after, user: user });
      const allRestaurants = await dataSources.placeAPI.allRestaurants();

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
      };
    },

    searchRestaurants: async (_, { lat, lng, tagIds, orderBy, priceLevel, pageSize = 10, after, user }, { dataSources }) => {
      logger.info('Search restaurants', { action: 'search', tags: tagIds, after: after, user: user });

      const allRestaurants = await dataSources.placeAPI.searchRestaurants(tagIds, lat, lng, orderBy, priceLevel);
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
      };
    },

    getRestaurantsByPlaceId: async (_, { placeIds, lat, lng, user }, { dataSources }) => {
      logger.info('Get restaurants', { action: 'get', place: placeIds, user: user });
      return dataSources.placeAPI.getRestaurants(placeIds, lat, lng);
    },
  },
  Restaurant: {
    reviews: async (r, _, { dataSources }) => dataSources.placeAPI.getReviews(r.placeId),
    isOpenNow: async (r, _, { dataSources }) => dataSources.placeAPI.isOpen(r.placeId),
    photoUrls: async (r, _, { dataSources }) => dataSources.placeAPI.getPhotoUrls(r.placeId, r.photoUrls),
  }
};

module.exports = resolvers;
