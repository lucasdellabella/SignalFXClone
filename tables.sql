CREATE TABLE graphs (
  id                 integer PRIMARY KEY,
  data_stream_id     integer  NOT NULL,
  FOREIGN KEY(data_stream_id) REFERENCES data_streams(id)
);

CREATE TABLE data_streams (
  id         integer PRIMARY KEY,
  time_stamp  integer NOT NULL,
  count      integer NOT NULL
);