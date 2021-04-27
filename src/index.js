const { ApolloServer, gql } = require('apollo-server');
const resolvers = require('./graphql/resolvers/routes');
const typeDefs = require('./graphql/schemas/schemas')



const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs,
  resolvers,
});

server.listen({
    port: process.env.PORT || 4000
}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});



