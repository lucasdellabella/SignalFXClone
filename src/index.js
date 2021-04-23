const { ApolloServer, gql } = require('apollo-server');
const { Client } = require('pg');

const connectionInfo = {
  user: 'alexkansas',
  password: '',
  host: 'localhost',
  port: '5432',
  database: 'signalfxclone' 
}

const client = new Client(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL } 
    : connectionInfo
);

client.connect();


// The GraphQL schema
const typeDefs = gql`
  type User {
    name: String!
    age: Int
    city: String
  }
  type Query {
    users: [User]
    user(name: String!): User
  }
  type Mutation {
    newUser(name: String!, age: Int, city: String): User
    deleteUser(name: String!): User
    dataPoint(dataStreamId: Int): Int
  }
`;

let users = {
  'alexey': {
    name: 'alexey',
    age: 29,
    city: 'San Francisco'
  },
  'lucas': {
    name: 'lucas',
    age: 26,
    city: 'San Francisco'
  },
}

let dataInLastFiveSec = {}

// TODO: setInterval timer is off!
setTimeout(() => {
  setInterval(() => {
    console.log((new Date).getTime() % 5000)

    //create a new row in graph table for a new DP
    //create new row for each k-v pair in last 5 sec
    //

    client.query(`INSERT into graphs VALUE (${data_stream_id})`, (err, res) => {
      if (err) throw err;
      for (let row of res.rows) {
        console.log(JSON.stringify(row));
      }
      client.end();
    });

    dataInLastFiveSec = {}
  }, 5000)

}, 5000 - (new Date).getTime() % 5000)

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    users: () => Object.values(users), 
    user: (_, { name }) => users[name], 
  },

  Mutation: {
    newUser:  (_, { name, age, city }) => users[name] = {name, age, city},
    deleteUser: (_, { name }) => {
      const userToDelete = users[name]
      delete users[name]
      return userToDelete
    },
    dataPoint: (_, { dataStreamId }) => {
      if (!(dataStreamId in dataInLastFiveSec)) {
        dataInLastFiveSec[dataStreamId] = 0
      } 
      dataInLastFiveSec[dataStreamId] += 1
    },

  }

};

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







