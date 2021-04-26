CREATE TABLE data_streams (
  id         SERIAL,
  time_stamp  BIGINT NOT NULL,
  count      integer NOT NULL,
  PRIMARY KEY (id, time_stamp)
);

CREATE TABLE graphs (
  id                 SERIAL,
  data_stream_id     integer  NOT NULL,
  PRIMARY KEY (id, data_stream_id)
);

  -- FOREIGN KEY(data_stream_id) REFERENCES data_streams(id)

-- ALTER TABLE data_streams ALTER COLUMN time_stamp TYPE BIGINT;
-- alter table data_streams drop constraint data_streams_pkey;
-- alter table data_streams add constraint data_streams_pkey primary key (id, time_stamp);
