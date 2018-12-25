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
  engine: {
    apiKey: "service:fooder-backend:BS33OMfO-W-cSUqzKtQXjw",
  },
  dataSources,
  context: () => {
    return {
      apiKey: 'AIzaSyAglSfq8l-Ko6eK1s-IRFe3H0ib2tGA_f8',
    };
  },

  introspection: true,
  playground: true,
  formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  },
});

server.listen({ port: process.env.PORT || 5000 , hostname: '0.0.0.0'}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
