#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

const fs = require("fs")
const path = require("path")

const outputDirectory = path.resolve(
  process.argv[2] || path.join(__dirname, "generated")
)
// Fixture generation is a short-lived, sequential CI operation.
// eslint-disable-next-line no-sync
fs.mkdirSync(outputDirectory, { recursive: true })

const countries = [
  "US",
  "BR",
  "ID",
  "AR",
  "TR",
  "GB",
  "JP",
  "MY",
  "ES",
  "PH",
  "FR",
  "SA",
  "TH",
  "RU",
  "MX",
  "CO",
  "IT",
  "PT",
  "CA",
  "UY",
  "CL",
  "IN",
  "NL",
  "ZA",
  "VE",
  "EG",
  "AU",
  "EC",
  "SG",
  "DE",
  "IE",
  "UA",
  "PY",
  "SE",
  "AE",
  "KW",
  "NG",
  "DO",
  "PL",
  "PR",
  "PE",
  "BY",
  "BE",
  "GT",
  "KR",
  "PK",
  "CR",
  "PA",
  "LV",
  "JO",
  "IL"
]

const destinations = [
  ["ATL", "Atlanta", "GA", -84.4277, 33.6407],
  ["LAX", "Los Angeles", "CA", -118.4085, 33.9416],
  ["ORD", "Chicago", "IL", -87.9073, 41.9742],
  ["DFW", "Dallas", "TX", -97.0403, 32.8998],
  ["DEN", "Denver", "CO", -104.6737, 39.8561],
  ["JFK", "New York", "NY", -73.7781, 40.6413],
  ["SFO", "San Francisco", "CA", -122.379, 37.6213],
  ["SEA", "Seattle", "WA", -122.3088, 47.4502],
  ["MIA", "Miami", "FL", -80.287, 25.7959],
  ["BOS", "Boston", "MA", -71.0096, 42.3656],
  ["PHX", "Phoenix", "AZ", -112.0116, 33.4342],
  ["LAS", "Las Vegas", "NV", -115.1523, 36.08]
]

const carriers = [
  ["American Airlines", "AA"],
  ["Delta Air Lines", "DL"],
  ["Southwest Airlines", "WN"],
  ["United Airlines", "UA"]
]

const csvCell = (value) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const writeCsv = (name, columns, rows) => {
  const body = [
    columns.join(","),
    ...rows.map((row) =>
      columns.map((column) => csvCell(row[column])).join(",")
    )
  ].join("\n")
  // eslint-disable-next-line no-sync
  fs.writeFileSync(path.join(outputDirectory, name), `${body}\n`)
}

const flightColumns = [
  "carrier_name",
  "dest",
  "dest_city",
  "dest_state",
  "dest_country",
  "dest_name",
  "dest_lon",
  "dest_lat",
  "dest_merc_x",
  "dest_merc_y",
  "origin",
  "origin_city",
  "origin_state",
  "origin_country",
  "origin_name",
  "origin_lon",
  "origin_lat",
  "origin_merc_x",
  "origin_merc_y",
  "airtime",
  "taxiin",
  "taxiout",
  "carrierdelay",
  "securitydelay",
  "lateaircraftdelay",
  "nasdelay",
  "weatherdelay",
  "arrtime",
  "deptime",
  "crsarrtime",
  "crsdeptime",
  "arrdelay",
  "depdelay",
  "crselapsedtime",
  "actualelapsedtime",
  "distance",
  "flight_month",
  "flight_dayofmonth",
  "flight_dayofweek",
  "flight_year",
  "flightnum",
  "uniquecarrier",
  "tailnum",
  "cancelled",
  "cancellationcode",
  "diverted",
  "arr_timestamp",
  "dep_timestamp",
  "plane_aircraft_type",
  "plane_engine_type",
  "plane_issue_date",
  "plane_manufacturer",
  "plane_model",
  "plane_status",
  "plane_type",
  "plane_year"
]

const flightRows = Array.from({ length: 1200 }, (_, index) => {
  const destination = destinations[index % destinations.length]
  const origin = destinations[(index + 5) % destinations.length]
  const carrier = carriers[index % carriers.length]
  const month = (index % 12) + 1
  const day = (index % 28) + 1
  const airtime = 40 + (index % 181)
  const departureHour = 5 + (index % 17)
  const departureMinute = index % 60
  const departure = `${departureHour
    .toString()
    .padStart(2, "0")}:${departureMinute.toString().padStart(2, "0")}:00`

  return {
    carrier_name: carrier[0],
    dest: destination[0],
    dest_city: destination[1],
    dest_state: destination[2],
    dest_country: "US",
    dest_name: `${destination[1]} International`,
    dest_lon: destination[3],
    dest_lat: destination[4],
    dest_merc_x: destination[3] * 100000,
    dest_merc_y: destination[4] * 100000,
    origin: origin[0],
    origin_city: origin[1],
    origin_state: origin[2],
    origin_country: "US",
    origin_name: `${origin[1]} International`,
    origin_lon: origin[3],
    origin_lat: origin[4],
    origin_merc_x: origin[3] * 100000,
    origin_merc_y: origin[4] * 100000,
    airtime,
    taxiin: 4 + (index % 17),
    taxiout: 8 + (index % 23),
    carrierdelay: index % 41,
    securitydelay: index % 7,
    lateaircraftdelay: index % 37,
    nasdelay: index % 29,
    weatherdelay: index % 13,
    arrtime: ((departureHour + 2) % 24) * 100 + departureMinute,
    deptime: departureHour * 100 + departureMinute,
    crsarrtime: ((departureHour + 2) % 24) * 100,
    crsdeptime: departureHour * 100,
    arrdelay: (index % 61) - 20,
    depdelay: (index % 47) - 15,
    crselapsedtime: airtime + 35,
    actualelapsedtime: airtime + 30 + (index % 12),
    distance: 250 + (index % 2750),
    flight_month: month,
    flight_dayofmonth: day,
    flight_dayofweek: (index % 7) + 1,
    flight_year: 2025,
    flightnum: 100 + index,
    uniquecarrier: carrier[1],
    tailnum: `N${(10000 + index).toString()}`,
    cancelled: index % 113 === 0 ? "true" : "false",
    cancellationcode: index % 113 === 0 ? "A" : "",
    diverted: index % 197 === 0 ? "true" : "false",
    arr_timestamp: `2025-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")} ${(
      (departureHour + 2) %
      24
    )
      .toString()
      .padStart(2, "0")}:${departureMinute.toString().padStart(2, "0")}:00`,
    dep_timestamp: `2025-${month
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")} ${departure}`,
    plane_aircraft_type: "Fixed wing multi engine",
    plane_engine_type: "Turbo-fan",
    plane_issue_date: "2018-01-01",
    plane_manufacturer: index % 2 === 0 ? "Boeing" : "Airbus",
    plane_model: index % 2 === 0 ? "737" : "A320",
    plane_status: "Valid",
    plane_type: "Corporation",
    plane_year: 2018
  }
})

const tweetRows = []
countries.forEach((country, countryIndex) => {
  const rowCount = 100 - countryIndex
  for (let index = 0; index < rowCount; index += 1) {
    const isCentralCluster = index % 4 === 0
    tweetRows.push({
      lon: isCentralCluster
        ? -25 + (index % 10) * 1.5
        : -165 + ((countryIndex * 37 + index * 11) % 330),
      lat: isCentralCluster
        ? 20 + (index % 8) * 2
        : -65 + ((countryIndex * 17 + index * 7) % 130),
      followees: 10 + ((countryIndex * 31 + index * 13) % 1000),
      followers: 5 + ((countryIndex * 19 + index * 7) % 5000),
      country,
      state_abbr: destinations[(countryIndex + index) % destinations.length][2],
      admin1: `Region ${(countryIndex % 10) + 1}`,
      join_time: `2025-${((countryIndex % 12) + 1)
        .toString()
        .padStart(2, "0")}-${((index % 28) + 1)
        .toString()
        .padStart(2, "0")} 12:00:00`
    })
  }
})

writeCsv("flights_donotmodify.csv", flightColumns, flightRows)
writeCsv(
  "tweets_nov_feb.csv",
  [
    "lon",
    "lat",
    "followees",
    "followers",
    "country",
    "state_abbr",
    "admin1",
    "join_time"
  ],
  tweetRows
)
writeCsv(
  "us_states_geo.csv",
  ["NAME", "ALAND", "AWATER"],
  [
    { NAME: "California", ALAND: 403466232000, AWATER: 20253000000 },
    { NAME: "Texas", ALAND: 676587800000, AWATER: 19092000000 },
    { NAME: "Florida", ALAND: 138887400000, AWATER: 31424000000 },
    { NAME: "New York", ALAND: 122057000000, AWATER: 19240000000 },
    { NAME: "Washington", ALAND: 172119000000, AWATER: 12542000000 }
  ]
)

// eslint-disable-next-line no-console
console.log(
  `Generated ${flightRows.length} flights, ${tweetRows.length} tweets, and 5 states in ${outputDirectory}`
)
