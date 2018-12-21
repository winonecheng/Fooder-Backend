const resolvers = {
  Query: {
    tags: async (_, __, { dataSources }) => dataSources.placeAPI.getTags(),
    restaurants: async (_, __, { dataSources }) => dataSources.placeAPI.getRestaurants(),
    searchRestaurants: (_, { tagIds }, { dataSources }) => dataSources.placeAPI.searchRestaurants(tagIds),
    getRestaurantByPlaceId: (_, { placeId }, { dataSources }) => dataSources.placeAPI.getRestaurant(placeId),
  },
  Restaurant: {
    reviews: async (r, _, { dataSources }) => dataSources.placeAPI.getReviews(r.placeId),
    isOpenNow: async (r, _, { dataSources }) => dataSources.placeAPI.isOpen(r.placeId),
    photoUrls: async (r, _, { dataSources }) => dataSources.placeAPI.getPhotoUrls(r.placeId),
  }
};

module.exports = resolvers;
