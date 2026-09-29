DROP TABLE IF EXISTS flights_donotmodify;
CREATE TABLE flights_donotmodify (
  carrier_name TEXT ENCODING DICT(32),
  dest TEXT ENCODING DICT(32),
  dest_city TEXT ENCODING DICT(32),
  dest_state TEXT ENCODING DICT(32),
  dest_country TEXT ENCODING DICT(32),
  dest_name TEXT ENCODING DICT(32),
  dest_lon DOUBLE,
  dest_lat DOUBLE,
  dest_merc_x DOUBLE,
  dest_merc_y DOUBLE,
  origin TEXT ENCODING DICT(32),
  origin_city TEXT ENCODING DICT(32),
  origin_state TEXT ENCODING DICT(32),
  origin_country TEXT ENCODING DICT(32),
  origin_name TEXT ENCODING DICT(32),
  origin_lon DOUBLE,
  origin_lat DOUBLE,
  origin_merc_x DOUBLE,
  origin_merc_y DOUBLE,
  airtime SMALLINT,
  taxiin SMALLINT,
  taxiout SMALLINT,
  carrierdelay SMALLINT,
  securitydelay SMALLINT,
  lateaircraftdelay SMALLINT,
  nasdelay SMALLINT,
  weatherdelay SMALLINT,
  arrtime SMALLINT,
  deptime SMALLINT,
  crsarrtime SMALLINT,
  crsdeptime SMALLINT,
  arrdelay SMALLINT,
  depdelay SMALLINT,
  crselapsedtime SMALLINT,
  actualelapsedtime SMALLINT,
  distance INT,
  flight_month SMALLINT,
  flight_dayofmonth SMALLINT,
  flight_dayofweek SMALLINT,
  flight_year SMALLINT,
  flightnum INT,
  uniquecarrier TEXT ENCODING DICT(32),
  tailnum TEXT ENCODING DICT(32),
  cancelled BOOLEAN,
  cancellationcode TEXT ENCODING DICT(32),
  diverted BOOLEAN,
  arr_timestamp TIMESTAMP(0),
  dep_timestamp TIMESTAMP(0),
  plane_aircraft_type TEXT ENCODING DICT(32),
  plane_engine_type TEXT ENCODING DICT(32),
  plane_issue_date DATE,
  plane_manufacturer TEXT ENCODING DICT(32),
  plane_model TEXT ENCODING DICT(32),
  plane_status TEXT ENCODING DICT(32),
  plane_type TEXT ENCODING DICT(32),
  plane_year SMALLINT
);
COPY flights_donotmodify
FROM '/var/lib/heavyai/storage/import/immerse-ci/flights_donotmodify.csv'
WITH (header = 'true');

DROP TABLE IF EXISTS tweets_nov_feb;
CREATE TABLE tweets_nov_feb (
  lon DOUBLE,
  lat DOUBLE,
  followees INT,
  followers INT,
  country TEXT ENCODING DICT(32),
  state_abbr TEXT ENCODING DICT(32),
  admin1 TEXT ENCODING DICT(32),
  join_time TIMESTAMP(0)
);
COPY tweets_nov_feb
FROM '/var/lib/heavyai/storage/import/immerse-ci/tweets_nov_feb.csv'
WITH (header = 'true');

DROP TABLE IF EXISTS us_states_geo;
CREATE TABLE us_states_geo (
  NAME TEXT ENCODING DICT(32),
  ALAND BIGINT,
  AWATER BIGINT
);
COPY us_states_geo
FROM '/var/lib/heavyai/storage/import/immerse-ci/us_states_geo.csv'
WITH (header = 'true');
