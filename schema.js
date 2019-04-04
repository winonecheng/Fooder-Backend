const { gql } = require('apollo-server');

const typeDefs = gql`
  enum AllowedOrder {
    default
    distance
  }

  type User {
    id: ID!
  }

  type Tag {
    id: ID!
    text: String!
  }

  type Location {
    type: String!
    coordinates: [Float]!
    address: String!
  }

  type Review {
    authorName: String
    authorPhotoUrl: String
    relativeTime: String
    rating: Int
    text: String
  }

  type Restaurant {
    id: ID
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

  type RestaurantConnection {
    cursor: String
    hasMore: Boolean!
    restaurants: [Restaurant]
  }

  type Query {
    appEntry(user: ID): User!
    tags: [Tag]!
    restaurants(
      pageSize: Int
      after: String
      ): RestaurantConnection!
    searchRestaurants(
      lat: Float!
      lng: Float!
      tagIds: [ID]!
      orderBy: AllowedOrder
      priceLevel: Int
      pageSize: Int
      after: String
      user: ID
      ): RestaurantConnection!
    getRestaurantsByPlaceId(placeIds: [String]!, user: ID): [Restaurant]
  }
`;

module.exports = typeDefs;
