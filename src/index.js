const { ApolloServer, gql } = require('apollo-server');
const { Client } = require('pg');

const client = new Client(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL } 
    : connectionInfo
);

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});

const connectionInfo = {
  user: 'alexkansas',
  password: '',
  host: 'localhost',
  port: '5432',
  database: 'signalfxclone' 
}


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







