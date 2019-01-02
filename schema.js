const { gql } = require('apollo-server');

const typeDefs = gql`
  type User {
    id: ID
  }

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
    priceLevel: String
    phoneNumber: String
    tags: [Tag]
    location: Location
    reviews: [Review]
    reviewCount: Int
    photoUrls: [String]
    isOpenNow: Boolean
    openingHours: [String]
    distance: Float
  }

  type Query {
    appEntry(user: ID): User
    tags: [Tag]
    restaurants(first: Int): [Restaurant]
    searchRestaurants(lat: Float!, lng: Float!, tagIds: [ID]!, first: Int, user: ID): [Restaurant]
    getRestaurantByPlaceId(placeId: String, user: ID): Restaurant
  }
`;

module.exports = typeDefs;
