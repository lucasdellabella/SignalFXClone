const { Pool } = require('pg');

const connectionInfo = {
  user: process.env.SIGNALFXCLONE_POSTGRES_USER,
  password: '',
  host: 'localhost',
  port: '5432',
  database: process.env.SIGNALFXCLONE_POSTGRES_DB,
}

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : connectionInfo
);

pool.connect();


// generate datapoints at certain time intervals
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


//get datastreamIds for ALl the graphs
const getDataStreamIdsForAllGraphs = async (id) => {
    const res = await pool.query(`SELECT * FROM graphs ORDER BY id`)

    graphs = {}

    for (const { id, data_stream_id } of res.rows) {
        if (id in graphs) {
            graphs[id].push(data_stream_id)
        } else {
            graphs[id] = [data_stream_id]
        }
    }

    return graphs
}

//get data for one specific graph
const getDataStreamIdsForOneGraph = async (id) => {
    const res = await pool.query(`
        SELECT * FROM graphs
        WHERE id = ${id}
    `)

    return res.rows.reduce((a, b) => {
        a.push(b.data_stream_id)
        return a;
    }, [])
}

//convert to a proper naming 
const fixDataPointKeyNames = (d) => {
  return {dataStreamId: d.id, timestamp: d.time_stamp, count: d.count}
}

//get all the data streams
const getDataStreams = async () => {
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

    return dataStreams.map((dataStream, i) => ({"id": dataStream[0].dataStreamId, "dataPoints": dataStream}))
}


// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    dataStreams: async () => {
        return await getDataStreams();
    },
    dataStream: async (_, { id }) => {
      const res = await pool.query(`
        SELECT * FROM data_streams
        WHERE id = ${id}
      `)
      console.log(res.rows)
      return res.rows.map(data => fixDataPointKeyNames(data))
    },
    graph: async (_, { id }) => {
      const res = await getDataStreamIdsForOneGraph(id)
      console.log(res);
      return ({ 
        id: id,
        dataStreamIds: res
      })
    },
    graphs: async () => {
        const graphsData = await getDataStreamIdsForAllGraphs()
        console.log(Object.entries(graphsData))
        const returnval = Object.entries(graphsData).map(([ k, v ]) => ({id: k, dataStreamIds: v}))
        console.log(returnval)
        return returnval
    },
  },
  Graph: {
      dataStreams: async (parent) => {
        // given all of the datastreams, find the specific datastream(s) that were asked for????
        const DS = (await getDataStreams())
        return DS.filter(dataStream => parent.dataStreamIds.includes(dataStream.id));
      }
  },
  DataStream: {
      dataPoints: (parent) => {
        return parent.dataPoints
      }
  },
  Mutation: {
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



module.exports = resolvers;