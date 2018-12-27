const resolvers = {
  Query: {
    tags: async (_, __, { dataSources }) => dataSources.placeAPI.getTags(),
    restaurants: async (_, { first = 10 }, { dataSources }) => dataSources.placeAPI.getRestaurants(first),
    searchRestaurants: async (_, { tagIds, first = 10 }, { dataSources }) => dataSources.placeAPI.searchRestaurants(tagIds, first),
    getRestaurantByPlaceId: async (_, { placeId }, { dataSources }) => dataSources.placeAPI.getRestaurant(placeId),
  },
  Restaurant: {
    reviews: async (r, _, { dataSources }) => dataSources.placeAPI.getReviews(r.placeId),
    isOpenNow: async (r, _, { dataSources }) => dataSources.placeAPI.isOpen(r.placeId),
    photoUrls: async (r, _, { dataSources }) => dataSources.placeAPI.getPhotoUrls(r.placeId),
    distance: (r, _, { dataSources }, info) => dataSources.placeAPI.getDistance(r.location, info),
    id: (r) => r._id.toString(),
  }
};

module.exports = resolvers;
