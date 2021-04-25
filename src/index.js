const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');

const connectionInfo = {
  user: 'alexkansas',
  password: '',
  host: 'localhost',
  port: '5432',
  database: 'signalfxclone' 
}

const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL } 
    : connectionInfo
);

pool.connect();


// The GraphQL schema
const typeDefs = gql`
  type User {
    name: String!
    age: Int
    city: String
  }

  type DataPoint {
    dataStreamId: ID!
    timestamp: String!
    count: Int!
  }

  type Graph {
    id: ID!
    dataStreams: [[DataPoint]]
  }

  type Query {
    users: [User]
    user(name: String!): User
    dataStreams: [[DataPoint]]
    dataStream(id: ID!): [DataPoint]
  }
  type Mutation {
    newUser(name: String!, age: Int, city: String): User
    deleteUser(name: String!): User
    logEvent(dataStreamId: Int!): Boolean
    createRowInDB(dataStreamId: Int!, currentTime: Int!, count: Int!): Boolean!
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

const timestampify = (ts) => Math.floor(ts / 5000) * 5000

// TODO: setInterval timer is off!
setTimeout(() => {
  setInterval(() => {
    const currentTime = timestampify(new Date().getTime())
    for (const dataStreamId of Object.keys(dataInLastFiveSec)) {
      const count = dataInLastFiveSec[dataStreamId]; 
      pool.query(`
          INSERT INTO data_streams 
          VALUES (${dataStreamId}, ${currentTime}, ${count})
        `, (err, res) => {
            if (err) throw err;
            for (let row of res.rows) {
              console.log(JSON.stringify(row));
            }
        });
      console.log(dataStreamId)
    }

    dataInLastFiveSec = {}
  }, 5000)

}, 5000 - new Date().getTime() % 5000)

const fixDataPointKeyNames = (d) => {
  return {dataStreamId: d.id, timestamp: d.time_stamp, count: d.count}
}

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    users: () => Object.values(users), 
    user: (_, { name }) => users[name],
    dataStreams: async () => {
      const res = await pool.query(`
          SELECT * FROM data_streams
          ORDER BY id
        `)   
      const dataStreams = [[fixDataPointKeyNames(res.rows[0])]];
      let previousRow = fixDataPointKeyNames(res.rows[0]);
      for (let i = 1; i < res.rows.length; i++) {
        const currentRow = fixDataPointKeyNames(res.rows[i])
        if (currentRow.dataStreamId !== previousRow.dataStreamId) {
          dataStreams.push([currentRow])
        } else {
          dataStreams[dataStreams.length - 1].push(currentRow)
        }
        previousRow = currentRow
      }
      console.log(dataStreams)
      return dataStreams
    },
    dataStream: async (_, { id }) => {
      const res = await pool.query(`
        SELECT * FROM data_streams 
        WHERE id = ${id}
      `)
      return res.rows.map(fixDataPointKeyNames)
    },
    graph: () => {
      
    },
    graphs: () => {

    },
  },

  Mutation: {
    newUser:  (_, { name, age, city }) => users[name] = {name, age, city},
    deleteUser: (_, { name }) => {
      const userToDelete = users[name]
      delete users[name]
      return userToDelete
    },
    logEvent: (_, { dataStreamId }) => {
      if (!(dataStreamId in dataInLastFiveSec)) {
        dataInLastFiveSec[dataStreamId] = 0
      } 
      dataInLastFiveSec[dataStreamId] += 1
    },
    createRowInDB: (_, {dataStreamId, currentTime, count }) => {
      client.query(`
          INSERT INTO data_streams 
          VALUES (${dataStreamId}, ${currentTime}, ${count})
        `, (err, res) => {
            if (err) throw err;
            for (let row of res.rows) {
              console.log(JSON.stringify(row));
            }
            client.end();
        });
        return true;
    }
  },
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