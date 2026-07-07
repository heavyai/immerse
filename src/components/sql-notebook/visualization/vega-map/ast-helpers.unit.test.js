// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  asContinuousDomainQuery,
  asOrdinalDomainQuery,
  overrideLimit,
  getAST,
  findQueryColumn
} from "./ast-helpers"

describe("ast-helpers", () => {
  describe("overrideLimit", () => {
    it("should add a limit according to limit arg", () => {
      const limit = 12345
      const limitQuery = overrideLimit("SELECT * FROM flights", limit)
      expect(limitQuery).toEqual(`SELECT * FROM "flights" LIMIT ${limit}`)
    })
    it("should not override limit when > limit in query", () => {
      const limit = 12345
      const limitQuery = overrideLimit("SELECT * FROM flights LIMIT 5", limit)
      expect(limitQuery).toEqual(`SELECT * FROM "flights" LIMIT 5`)
    })
    it("should override limit when < limit in query", () => {
      const limit = 400
      const limitQuery = overrideLimit("SELECT * FROM flights LIMIT 500", limit)
      expect(limitQuery).toEqual(`SELECT * FROM "flights" LIMIT ${limit}`)
    })
    it("should throw error if query cannot be parsed", () => {
      const doTheLimit = () => {
        overrideLimit("SELECT FROM flights LIMIT 10000")
      }
      expect(doTheLimit).toThrow()
    })
  })

  describe("asOrdinalDomainQuery", () => {
    // query, limit, field
    it("should group by field and sort by top-k", () => {
      const ordinalDomainQuery = asOrdinalDomainQuery(
        "SELECT carrier_name, arrdelay, airtime from flights",
        100,
        "carrier_name"
      )
      expect(ordinalDomainQuery).toEqual(
        'SELECT carrier_name, COUNT(1) AS "topKNumRecords" FROM "flights" GROUP BY carrier_name ORDER BY "topKNumRecords" DESC LIMIT 100'
      )
    })
    it("should handle string functions", () => {
      const ordinalDomainQuery = asOrdinalDomainQuery(
        "SELECT substr(carrier_name, 0, 4) as carrier_short, arrdelay, airtime from flights",
        100,
        "carrier_short"
      )
      expect(ordinalDomainQuery).toEqual(
        'SELECT substr(carrier_name, 0, 4) AS "carrier_short", COUNT(1) AS "topKNumRecords" FROM "flights" GROUP BY substr(carrier_name, 0, 4) ORDER BY "topKNumRecords" DESC LIMIT 100'
      )
    })
    it("should not modify filters in topk query", () => {
      const ordinalDomainQuery = asOrdinalDomainQuery(
        "SELECT carrier_name, arrdelay, airtime from flights where arrdelay < 5 AND airtime < 20 AND char_length(carrier_name) < 10",
        100,
        "carrier_name"
      )
      expect(ordinalDomainQuery).toEqual(
        'SELECT carrier_name, COUNT(1) AS "topKNumRecords" FROM "flights" WHERE arrdelay < 5 AND airtime < 20 AND char_length(carrier_name) < 10 GROUP BY carrier_name ORDER BY "topKNumRecords" DESC LIMIT 100'
      )
    })
  })
  describe("asContinuousDomainQuery", () => {
    it("should remove all projected columns and add min/max", () => {
      const domainQuery = asContinuousDomainQuery(
        "SELECT carrier_name, arrdelay, airtime from flights",
        "arrdelay"
      )
      expect(domainQuery).toEqual(
        'WITH "continuousDomainQuery" AS (SELECT carrier_name, arrdelay, airtime FROM "flights") SELECT MIN("arrdelay"), MAX("arrdelay") FROM "continuousDomainQuery"'
      )
    })
    it("should handle expressions/functions", () => {
      const domainQuery = asContinuousDomainQuery(
        "SELECT carrier_name, arrdelay-5 as arrdelaybutless, airtime from flights",
        "arrdelaybutless"
      )
      expect(domainQuery).toEqual(
        'WITH "continuousDomainQuery" AS (SELECT carrier_name, arrdelay - 5 AS "arrdelaybutless", airtime FROM "flights") SELECT MIN("arrdelaybutless"), MAX("arrdelaybutless") FROM "continuousDomainQuery"'
      )
    })
    it("should not modify any existing filters", () => {
      const domainQuery = asContinuousDomainQuery(
        "SELECT carrier_name, arrdelay, airtime from flights where arrdelay > 10 AND airtime % 2 = 0",
        "arrdelay"
      )
      expect(domainQuery).toEqual(
        'WITH "continuousDomainQuery" AS (SELECT carrier_name, arrdelay, airtime FROM "flights" WHERE arrdelay > 10 AND airtime % 2 = 0) SELECT MIN("arrdelay"), MAX("arrdelay") FROM "continuousDomainQuery"'
      )
    })
    it("should handle grouped queries", () => {
      const domainQuery = asContinuousDomainQuery(
        "SELECT AVG(origin_lon) AS origin_lon, AVG(origin_lat) AS origin_lat, COUNT(*) AS num_flights, AVG(depdelay) AS avg_departure_delay FROM flights_2008_10k WHERE origin IS NOT NULL GROUP BY origin",
        "num_flights"
      )
      expect(domainQuery).toEqual(
        'WITH "continuousDomainQuery" AS (SELECT AVG(origin_lon) AS "origin_lon", AVG(origin_lat) AS "origin_lat", COUNT(*) AS "num_flights", AVG(depdelay) AS "avg_departure_delay" FROM "flights_2008_10k" WHERE origin IS NOT NULL GROUP BY origin) SELECT MIN("num_flights"), MAX("num_flights") FROM "continuousDomainQuery"'
      )
    })
  })

  describe("findQueryColumn", () => {
    it("should find a basic column ref", () => {
      const ast = getAST("SELECT one, two, three from table_1")
      const col = findQueryColumn(ast, "three")
      expect(col.expr.column.expr.value).toBe("three")
    })
    it("should find aliased things", () => {
      const ast = getAST("SELECT one, two, three as four from table_1")
      const col = findQueryColumn(ast, "four")
      expect(col.expr.column.expr.value).toBe("three")
    })
  })
})
