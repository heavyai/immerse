// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import genSQL, {
  has2ndDimension,
  toAggExpr,
  groupingCase,
  toWhereClause,
  genLimitSQL,
  genTopKSQL
} from "./sql-utils"

describe("Stacked Bar SQL Utils", () => {
  describe("has2ndDimension", () => {
    let dimensions = [{ value: "dest_state" }, { value: "origin_state" }]

    it("returns true when there are two dimensions", () => {
      expect(has2ndDimension(dimensions)).toEqual(true)
    })

    it("returns false when there is one dimension", () => {
      dimensions = [{ value: "dest_state" }, {}]
      expect(has2ndDimension(dimensions)).toEqual(false)
    })
  })

  describe("toAggExpr", () => {
    let measure = { aggType: "Sum", value: "airtime" }
    const sortColumn = { col: { name: "countval" }, order: "desc" }

    it("correctly maps a measure object with aggType Sum to the correct sql string", () => {
      expect(toAggExpr(measure)).toEqual("sum(airtime) AS val")
    })

    it("correctly maps a measure object with aggType Avg to the correct sql string", () => {
      measure.aggType = "Avg"
      expect(toAggExpr(measure)).toEqual("avg(airtime) AS val")
    })

    it("correctly maps a measure object with aggType '# Unique' to the correct sql string", () => {
      measure.aggType = "# Unique"
      expect(toAggExpr(measure)).toEqual(
        "approx_count_distinct(airtime) AS val"
      )
    })

    it("correctly maps a measure object with aggType Custom to the correct sql string", () => {
      measure = {
        aggType: "Custom",
        value: "min(arrdelay)"
      }
      expect(toAggExpr(measure)).toEqual("min(arrdelay) AS val")
    })

    it("correctly maps a measure object to the correct sql string when the param `alias` is false", () => {
      expect(toAggExpr(measure, false)).toEqual("min(arrdelay)")
    })

    it("correctly maps a sortColumn with the 'name' property of 'countval' to the correct sql string", () => {
      expect(toAggExpr(measure, false, sortColumn)).toEqual("count(*)")
    })
  })

  describe("topNCase", () => {
    let dimensions = [{ value: "dest_state" }, { value: "origin_state" }]
    const topN = ["CA", "NY", "NV", "NC", "AK"]
    let showOther = true

    it("returns a CASE statement when there are 2 dimensions and a topN array", () => {
      expect(groupingCase(dimensions, topN, showOther)).toEqual(
        "CASE WHEN origin_state IN ('CA','NY','NV','NC','AK') THEN origin_state ELSE 'other' END AS key1,"
      )
    })

    it("returns a CASE statement with ELSE 'undefined' when showOther is false", () => {
      showOther = false
      expect(groupingCase(dimensions, topN, showOther)).toEqual(
        "CASE WHEN origin_state IN ('CA','NY','NV','NC','AK') THEN origin_state ELSE 'undefined' END AS key1,"
      )
    })

    it("returns an empty string when there is a single dimension", () => {
      dimensions = [{ value: "dest_state" }, {}]
      expect(groupingCase(dimensions, topN, showOther)).toEqual("")
    })
  })

  describe("toWhereClause", () => {
    let measures = [{ aggType: "Sum", value: "airtime" }]
    const dimensions = [{ value: "dest_state" }, { value: "origin_state" }]
    let filterString = "(carrier_name = 'My Crappy Airline')"
    const globalFilterString = ""
    let showNullDimensions = true
    const dataSource = "flights"
    const numberGroups = 50
    const sortColumn = { col: { name: "val" }, order: "desc" }

    it("constructs the correct SQL WHERE clause for the final query with a color (2nd) dimension", () => {
      expect(
        toWhereClause({
          measures,
          dimensions,
          filterString,
          globalFilterString,
          showNullDimensions,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual(
        "WHERE ((dest_state IN (SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 50) AND airtime IS NOT NULL OR dest_state IS NULL) AND (carrier_name = 'My Crappy Airline'))"
      )
    })

    it("constructs the correct SQL WHERE clause for the final query with a color (2nd) dimension and showNullDimensions is false", () => {
      showNullDimensions = false
      expect(
        toWhereClause({
          measures,
          dimensions,
          filterString,
          globalFilterString,
          showNullDimensions,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual(
        "WHERE ((dest_state IN (SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 50) AND airtime IS NOT NULL) AND (carrier_name = 'My Crappy Airline'))"
      )
    })

    it("constructs the correct SQL WHERE clause for the final query with one dimension and showNullDimensions is false", () => {
      dimensions[1] = {}
      expect(
        toWhereClause({
          measures,
          dimensions,
          filterString,
          globalFilterString,
          showNullDimensions,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual(
        "WHERE (airtime IS NOT NULL AND (carrier_name = 'My Crappy Airline') AND dest_state IS NOT NULL)"
      )
    })

    it("returns the correct SQL WHERE clause with a single dimension, showNullDimensions is true, and no filterString", () => {
      showNullDimensions = true
      filterString = null
      expect(
        toWhereClause({
          measures,
          dimensions,
          filterString,
          globalFilterString,
          showNullDimensions,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual("WHERE (airtime IS NOT NULL)")
    })

    it("returns an empty string when given a single dimension, showNullDimensions is true, no filterString, and measure of count(*)", () => {
      measures = [{ aggType: "Count", value: "*" }]
      expect(
        toWhereClause({
          measures,
          dimensions,
          filterString,
          globalFilterString,
          showNullDimensions,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual("")
    })
  })

  describe("genLimitSQL", () => {
    const dimensions = [{ value: "dest_state" }, { value: "origin_state" }]
    const measures = [{ aggType: "Sum", value: "airtime" }]
    const dataSource = "flights"
    let numberGroups = 50
    const sortColumn = { col: { name: "val" }, order: "desc" }

    it("correctly maps props to an SQL limit query", () => {
      expect(
        genLimitSQL({
          dimensions,
          measures,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual(
        "SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 50"
      )
    })

    it("correctly maps props to an SQL limit query with the correct number of groups", () => {
      numberGroups = 15
      expect(
        genLimitSQL({
          dimensions,
          measures,
          dataSource,
          numberGroups,
          sortColumn
        })
      ).toEqual(
        "SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 15"
      )
    })
  })

  describe("genTopKSQL", () => {
    const dimensions = [{ value: "dest_state" }, { value: "origin_state" }]
    const measures = [{ aggType: "Sum", value: "airtime" }]
    const dataSource = "flights"
    const filterString = "airtime >= 20"
    const globalFilterString = null
    let sortColumn = { col: { name: "val" }, order: "desc" }

    it("correctly generates the topK SQL", () => {
      expect(
        genTopKSQL({
          dimensions,
          measures,
          dataSource,
          filterString,
          globalFilterString,
          sortColumn
        })
      ).toEqual(
        "SELECT origin_state AS key0, sum(airtime) AS val FROM flights WHERE airtime >= 20 GROUP BY key0 HAVING val IS NOT NULL AND key0 IS NOT NULL ORDER BY val desc LIMIT 5"
      )
    })

    it("correctly generates the topK SQL when sortColumn changes", () => {
      sortColumn = { col: { name: "key0" }, order: "asc" }
      expect(
        genTopKSQL({
          dimensions,
          measures,
          dataSource,
          filterString,
          globalFilterString,
          sortColumn
        })
      ).toEqual(
        "SELECT origin_state AS key0, sum(airtime) AS val FROM flights WHERE airtime >= 20 GROUP BY key0 HAVING val IS NOT NULL AND key0 IS NOT NULL ORDER BY key0 asc LIMIT 5"
      )
    })
  })

  describe("genSQL", () => {
    const dimensions = [{ value: "dest_state" }, { value: "origin_state" }]
    const measures = [{ aggType: "Sum", value: "airtime" }]
    const dataSource = "flights"
    let groups = ["CA", "NY", "NV", "NC", "AK"]
    let filterString = null
    const globalFilterString = null
    const showOther = null
    const sortColumn = { col: { name: "val" }, order: "desc" }
    const showNullDimensions = false
    const numberGroups = 100

    it("correctly generates the final SQL query", () => {
      expect(
        genSQL({
          dimensions,
          measures,
          dataSource,
          groups,
          filterString,
          globalFilterString,
          showOther,
          sortColumn,
          showNullDimensions,
          numberGroups
        })
      ).toEqual(
        "SELECT dest_state AS key0, CASE WHEN origin_state IN ('CA','NY','NV','NC','AK') THEN origin_state ELSE 'undefined' END AS key1, sum(airtime) AS val  FROM flights WHERE ((dest_state IN (SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 100) AND airtime IS NOT NULL)) GROUP BY key0, key1 ORDER BY val desc NULLS LAST"
      )
    })

    it("correctly generates the final SQL query when passed a filterString", () => {
      filterString = "arr_delay > 10"
      expect(
        genSQL({
          dimensions,
          measures,
          dataSource,
          groups,
          filterString,
          globalFilterString,
          showOther,
          sortColumn,
          showNullDimensions,
          numberGroups
        })
      ).toEqual(
        "SELECT dest_state AS key0, CASE WHEN origin_state IN ('CA','NY','NV','NC','AK') THEN origin_state ELSE 'undefined' END AS key1, sum(airtime) AS val  FROM flights WHERE ((dest_state IN (SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 100) AND airtime IS NOT NULL) AND arr_delay > 10) GROUP BY key0, key1 ORDER BY val desc NULLS LAST"
      )
    })

    it("correctly generates the final SQL query when topN values contain single quotes", () => {
      groups = [
        "Chicago O'Hare International",
        "Dallas-Fort Worth International",
        "William B Hartsfield-Atlanta Int'l",
        "Los Angeles International",
        "Phoenix Sky Harbor International"
      ]
      expect(
        genSQL({
          dimensions,
          measures,
          dataSource,
          groups,
          filterString,
          globalFilterString,
          showOther,
          sortColumn,
          showNullDimensions,
          numberGroups
        })
      ).toEqual(
        "SELECT dest_state AS key0, CASE WHEN origin_state IN ('Chicago O''Hare International','Dallas-Fort Worth International','William B Hartsfield-Atlanta Int''l','Los Angeles International','Phoenix Sky Harbor International') THEN origin_state ELSE 'undefined' END AS key1, sum(airtime) AS val  FROM flights WHERE ((dest_state IN (SELECT dest_state FROM flights GROUP BY dest_state HAVING sum(airtime) IS NOT NULL ORDER BY sum(airtime) DESC LIMIT 100) AND airtime IS NOT NULL) AND arr_delay > 10) GROUP BY key0, key1 ORDER BY val desc NULLS LAST"
      )
    })

    it("correctly generates the final SQL query when passed a single dimension", () => {
      dimensions[1] = {}
      expect(
        genSQL({
          dimensions,
          measures,
          dataSource,
          groups,
          filterString,
          globalFilterString,
          showOther,
          sortColumn,
          showNullDimensions,
          numberGroups
        })
      ).toEqual(
        "SELECT dest_state AS key0,  sum(airtime) AS val  FROM flights WHERE (airtime IS NOT NULL AND arr_delay > 10 AND dest_state IS NOT NULL) GROUP BY key0 ORDER BY val desc NULLS LAST LIMIT 100"
      )
    })
  })
})
