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
      apiKey: 'AIzaSyA1ug3pDy-rR6btRx88y-K9znjzRTUeHIE',
    };
  },
});

server.listen(port=5000).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
