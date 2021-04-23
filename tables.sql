CREATE TABLE data_streams (
  id         SERIAL PRIMARY KEY,
  time_stamp  integer NOT NULL,
  count      integer NOT NULL
);

CREATE TABLE graphs (
  id                 SERIAL PRIMARY KEY,
  data_stream_id     integer  NOT NULL,
  FOREIGN KEY(data_stream_id) REFERENCES data_streams(id)
);