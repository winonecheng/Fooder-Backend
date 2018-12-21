const { gql } = require('apollo-server');

const typeDefs = gql`
  type Tag {
    id: ID
    text: String
  }

  type Location {
    lat: Float
    lng: Float
    address: String
  }

  type Review {
    authorName: String
    authorPhotoUrl: String
    relativeTime: String
    rating: Int
    text: String
  }

  type Restaurant {
    id: ID,
    name: String
    placeId: String
    rating: Float
    priceLevel: Int
    phoneNumber: String
    tags: [Tag]
    location: Location
    reviews: [Review]
    photoUrls: [String]
    isOpenNow: Boolean
  }

  type Query {
    tags: [Tag]
    restaurants: [Restaurant]
    searchRestaurants(tagIds: [ID]): [Restaurant]
    getRestaurantByPlaceId(placeId: String): Restaurant
  }
`;

module.exports = typeDefs;
