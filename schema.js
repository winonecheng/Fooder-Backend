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
    priceLevel: String
    phoneNumber: String
    tags: [Tag]
    location: Location
    reviews: [Review]
    reviewCount: Int
    photoUrls: [String]
    isOpenNow: Boolean
    openingHours: [String]
  }

  type Query {
    tags: [Tag]
    restaurants(first: Int): [Restaurant]
    searchRestaurants(tagIds: [ID], first: Int): [Restaurant]
    getRestaurantByPlaceId(placeId: String): Restaurant
  }
`;

module.exports = typeDefs;
