const { ApolloServer, gql } = require('apollo-server');
// const { Client } = require('pg');

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// client.connect();

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//   if (err) throw err;
//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
//   client.end();
// });


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
    newUser:  (_, { name, age, city }) => users[name] = {name, age, city}
  }

};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
