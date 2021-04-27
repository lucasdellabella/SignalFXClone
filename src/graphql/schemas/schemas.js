const { gql } = require('apollo-server');


// The GraphQL schema
const typeDefs = gql`
  type DataPoint {
    timestamp: String!
    count: Int!
  }

  type Graph {
    id: ID!
    dataStreams: [DataStream]
  }

  type DataStream {
    id: ID!
    dataPoints: [DataPoint]
  }

  type Query {
    dataStream(id: ID!): DataStream
    dataStreams: [DataStream]
    graph(id: ID!): Graph
    graphs: [Graph]
  }

  type Mutation {
    logEvent(dataStreamId: Int!): Boolean
    createRowInDB(dataStreamId: Int!, currentTime: Int!, count: Int!): Boolean!
  }
`;


module.exports = typeDefs;