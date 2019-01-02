require('dotenv').config()

const logger = require('heroku-logger')

const { ApolloServer } = require('apollo-server');

const PlaceAPI = require('./datasources/place');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { connectDB } = require('./utils');

const db = connectDB();

const dataSources = () => ({
  placeAPI: new PlaceAPI(db),
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context: () => {
    return {
      apiKey: process.env.GOOGLE_APIKEY,
    };
  },
  formatError: error => {
    logger.error(error.message, {value: error});
    return error;
  },
});

server.listen({ port: process.env.PORT || 5000}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
