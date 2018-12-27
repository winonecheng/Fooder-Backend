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
      apiKey: 'AIzaSyAdXyt70-ESrNFLKhduncw6C-TJv4oXUdo',
    };
  },
  introspection: process.env.NODE_ENV === 'production' ? false : true,
  playground: process.env.NODE_ENV === 'production' ? false : true,
  formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  },
});

server.listen({ port: process.env.PORT || 5000}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
