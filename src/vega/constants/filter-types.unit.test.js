// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  buildFilterSql,
  buildOmnifilterSql,
  buildFilterLabel
} from "./filter-types"

import {
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_IN,
  FILTER_TYPE_POLYGON,
  FILTER_TYPE_ST_CONTAINS,
  FILTER_TYPE_ST_INTERSECTS,
  FILTER_TYPE_DISTANCE,
  FILTER_TYPE_ST_DISTANCE,
  FILTER_TYPE_BOUNDING_BOX,
  FILTER_TYPE_NOT,
  FILTER_TYPE_UNLIKELY,
  FILTER_TYPE_AND,
  FILTER_TYPE_OR,
  FILTER_TYPE_EMPTY_COHORT,
  FILTER_TYPE_SQL
} from "vega/constants/filter-type-constants"

describe("buildFilterSql tests", () => {
  it("should build a SQL filter", () => {
    const sql = "foo = 10"
    const filter = {
      filterType: FILTER_TYPE_SQL,
      sql
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([`(${sql})`])
  })

  it("should build an EMPTY_COHORT filter", () => {
    const sql = "foo = 10"
    const filter = {
      filterType: FILTER_TYPE_EMPTY_COHORT,
      sql
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([`(${sql})`])
  })

  it("should build an AND filter", () => {
    const sql = "foo = 10 AND baz = 5"
    const filter = {
      filterType: FILTER_TYPE_AND,
      filters: [
        {
          filterType: FILTER_TYPE_SIMPLE,
          dataSource: "barTable",
          dataExpression: "foo",
          dataType: "FLOAT",
          operator: "=",
          value: 10
        },
        {
          filterType: FILTER_TYPE_SIMPLE,
          dataSource: "barTable",
          dataExpression: "baz",
          dataType: "FLOAT",
          operator: "=",
          value: 5
        }
      ]
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([`(${sql})`])
  })
  it("should build an OR filter", () => {
    const sql = "foo = 10 OR baz = 5"
    const filter = {
      filterType: FILTER_TYPE_OR,
      filters: [
        {
          filterType: FILTER_TYPE_SIMPLE,
          dataSource: "barTable",
          dataExpression: "foo",
          dataType: "FLOAT",
          operator: "=",
          value: 10
        },
        {
          filterType: FILTER_TYPE_SIMPLE,
          dataSource: "barTable",
          dataExpression: "baz",
          dataType: "FLOAT",
          operator: "=",
          value: 5
        }
      ]
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([`(${sql})`])
  })
  it("should build a NOT filter", () => {
    const sql = "NOT (foo = 10)"
    const filter = {
      filterType: FILTER_TYPE_NOT,
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build an UNLIKELY filter", () => {
    const sql = "UNLIKELY (foo = 10)"
    const filter = {
      filterType: FILTER_TYPE_UNLIKELY,
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build an ISNULL filter", () => {
    const sql = "foo IS NULL"
    const filter = {
      filterType: FILTER_TYPE_ISNULL,
      dataSource: "barTable",
      dataExpression: "foo"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build an ISNOTNULL filter", () => {
    const sql = "foo IS NOT NULL"
    const filter = {
      filterType: FILTER_TYPE_ISNOTNULL,
      dataSource: "barTable",
      dataExpression: "foo"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a ST_Contains filter", () => {
    const sql =
      "ST_Contains(ST_GeomFromText('POLYGON((-107 40,-107 37,-104 35,-102 38,-105 41,-107 40))', 4326), test_data_expression)"
    const filter = {
      dataExpression: "test_data_expression",
      dataSource: "test_table",
      lonExpression: "surface_lon",
      lonDataType: "FLOAT",
      latExpression: "surface_lat",
      latDataType: "FLOAT",
      isGeoJoin: false,
      filterType: FILTER_TYPE_ST_CONTAINS,
      polygon: [
        [-107, 40],
        [-107, 37],
        [-104, 35],
        [-102, 38],
        [-105, 41]
      ],
      points: [
        [-107, 40],
        [-107, 37],
        [-104, 35],
        [-102, 38],
        [-105, 41]
      ],
      position: [0, 0],
      originalPoints: [
        [-11960435, 4963262],
        [-12009869, 4574847],
        [-11635578, 4200556],
        [-11360157, 4709027],
        [-11699137, 5055069]
      ],
      layerId: "master",
      aabox: {
        "0": -12009869,
        "1": 4200556,
        "2": -11360157,
        "3": 5055069
      },
      useLonLat: true
    }
    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a ST_Intersects filter", () => {
    const sql =
      "ST_Intersects(ST_GeomFromText('POLYGON((-107 40,-107 37,-104 35,-102 38,-105 41,-107 40))', 4326), test_data_expression)"
    const filter = {
      dataExpression: "test_data_expression",
      dataSource: "test_table",
      lonExpression: "surface_lon",
      lonDataType: "FLOAT",
      latExpression: "surface_lat",
      latDataType: "FLOAT",
      isGeoJoin: false,
      filterType: FILTER_TYPE_ST_INTERSECTS,
      polygon: [
        [-107, 40],
        [-107, 37],
        [-104, 35],
        [-102, 38],
        [-105, 41]
      ],
      points: [
        [-107, 40],
        [-107, 37],
        [-104, 35],
        [-102, 38],
        [-105, 41]
      ],
      position: [0, 0],
      originalPoints: [
        [-11960435, 4963262],
        [-12009869, 4574847],
        [-11635578, 4200556],
        [-11360157, 4709027],
        [-11699137, 5055069]
      ],
      layerId: "master",
      aabox: {
        "0": -12009869,
        "1": 4200556,
        "2": -11360157,
        "3": 5055069
      },
      useLonLat: true
    }
    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a ST_Distance filter", () => {
    const sql =
      "ST_Distance(ST_GeomFromText('POINT(-100 40)', 4326), lat1) <= 3.5"
    const filter = {
      dataSource: "test_table",
      dataExpression: "lat1",
      dataType: "FLOAT",
      isGeoJoin: false,
      filterType: FILTER_TYPE_ST_DISTANCE,
      point: [-100, 40],
      originalPosition: [-11805069, 4730213.5],
      radius: 350,
      distanceInMeters: 350000,
      distanceInKM: 350,
      layerId: "master"
    }
    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a POLYGON filter", () => {
    const sql =
      "(surface_lon is not null AND surface_lat is not null AND UNLIKELY(surface_lon >= -107.886488845 AND surface_lon <= -102.050026645 AND surface_lat >= 35.269428871 AND surface_lat <= 41.289040441) AND ST_Contains(ST_GeomFromText('POLYGON((-107 40,-107 37,-104 35,-102 38,-105 41,-107 40))', 4326), ST_SetSRID(ST_Point(surface_lon, surface_lat), 4326)))"
    const filter = {
      dataSource: "test_table",
      lonExpression: "surface_lon",
      lonDataType: "FLOAT",
      latExpression: "surface_lat",
      latDataType: "FLOAT",
      isGeoJoin: false,
      filterType: FILTER_TYPE_POLYGON,
      polygon: [
        [-107, 40],
        [-107, 37],
        [-104, 35],
        [-102, 38],
        [-105, 41]
      ],
      points: [
        [-107, 40],
        [-107, 37],
        [-104, 35],
        [-102, 38],
        [-105, 41]
      ],
      position: [0, 0],
      originalPoints: [
        [-11960435, 4963262],
        [-12009869, 4574847],
        [-11635578, 4200556],
        [-11360157, 4709027],
        [-11699137, 5055069]
      ],
      layerId: "master",
      aabox: {
        "0": -12009869,
        "1": 4200556,
        "2": -11360157,
        "3": 5055069
      },
      useLonLat: true
    }
    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a DISTANCE filter", () => {
    const sql = "DISTANCE_IN_METERS(-100, 40, lon1, lat1) < 350000"
    const filter = {
      dataSource: "test_table",
      lonExpression: "lon1",
      lonDataType: "FLOAT",
      latExpression: "lat1",
      latDataType: "FLOAT",
      isGeoJoin: false,
      filterType: FILTER_TYPE_DISTANCE,
      point: [-100, 40],
      originalPosition: [-11805069, 4730213.5],
      radius: 350,
      distanceInMeters: 350000,
      distanceInKM: 350,
      layerId: "master"
    }
    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a BOUNDING_BOX filter", () => {
    const bboxSql1 = `(lonA is not null
          AND latA is not null
          AND lonA >= -75 AND lonA <= 75 AND latA >= -31 AND latA <= 70)`
    const bboxFilter1 = {
      filterType: FILTER_TYPE_BOUNDING_BOX,
      dataSource: "test_pointmap_table_1",
      lonExpression: "lonA",
      lonDataType: "FLOAT",
      latExpression: "latA",
      latDataType: "FLOAT",
      isGeoJoin: false,
      lonMin: -75,
      lonMax: 75,
      latMin: -31,
      latMax: 70,
      layerId: 1
    }
    const builtSql = buildFilterSql([bboxFilter1])
    expect(builtSql).toEqual([bboxSql1])
  })
  it("should build an IN FLOAT filter", () => {
    const sql = "foo IN (1,2,3)"
    const filter = {
      filterType: FILTER_TYPE_IN,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "FLOAT",
      values: [1, 2, 3]
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build an IN STR filter", () => {
    const sql = "foo IN ('a','b','c')"
    const filter = {
      filterType: FILTER_TYPE_IN,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "STR",
      values: ["a", "b", "c"]
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build an IN DATE filter", () => {
    const sql =
      "foo IN ('2019-01-01 00:00:00.000','2019-02-01 00:00:00.000','2019-03-01 00:00:00.000')"
    const filter = {
      filterType: FILTER_TYPE_IN,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "DATE",
      values: ["2019-01-01", "2019-02-01", "2019-03-01"]
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a BETWEEN FLOAT filter", () => {
    const sql = "foo BETWEEN 10 AND 20"
    const filter = {
      filterType: FILTER_TYPE_BETWEEN,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "FLOAT",
      start: 10,
      end: 20
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a BETWEEN DATE filter", () => {
    const sql =
      "foo BETWEEN '2019-01-01 00:00:00.000' AND '2019-12-31 00:00:00.000'"
    const filter = {
      filterType: FILTER_TYPE_BETWEEN,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "DATE",
      start: "2019-01-01",
      end: "2019-12-31"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE FLOAT filter", () => {
    const sql = "foo = 10"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "FLOAT",
      operator: "=",
      value: 10
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })

  it("should build multiple SIMPLE FLOAT filters", () => {
    const sql = ["foo = 10", "bar < 5"]
    const filterA = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "FLOAT",
      operator: "=",
      value: 10
    }

    const filterB = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "bar",
      dataType: "FLOAT",
      operator: "<",
      value: 5
    }

    const builtSql = buildFilterSql([filterA, filterB])
    expect(builtSql).toEqual(sql)
  })
  it("should build a SIMPLE FLOAT >= filter", () => {
    const sql = "foo >= 10"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "FLOAT",
      operator: ">=",
      value: 10
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE STR filter", () => {
    const sql = "foo = 'bar'"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "STR",
      operator: "=",
      value: "bar"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE STR LIKE filter", () => {
    const sql = "foo LIKE '%bar%'"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "STR",
      operator: "LIKE",
      value: "bar"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE STR ENDS_WITH filter", () => {
    const sql = "foo LIKE '%bar'"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "STR",
      operator: "ENDS_WITH",
      value: "bar"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE STR STARTS_WITH filter", () => {
    const sql = "foo LIKE 'bar%'"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "STR",
      operator: "STARTS_WITH",
      value: "bar"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE DATE filter", () => {
    const sql = "foo = '2019-12-22 00:00:00.000'"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: "foo",
      dataType: "DATE",
      operator: "=",
      value: "2019-12-22 00:00:00"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })
  it("should build a SIMPLE FLOAT filter via buildOmnifilterSql", () => {
    const sql = "foo = 10"
    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })
  it("should build a SIMPLE FLOAT label w/o label", () => {
    const sql = "foo = 10"
    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildFilterLabel(filterMetadata)
    expect(builtSql).toEqual(sql)
  })
  it("should build a SIMPLE FLOAT label w/o label", () => {
    const label = "labeled filter"
    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      label,
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtLabel = buildFilterLabel(filterMetadata)
    expect(builtLabel).toEqual(label)
  })
  it("should build a SIMPLE FLOAT cohort", () => {
    const sql =
      "cohortColumn IN ( SELECT cohortColumn FROM cohortTable WHERE foo = 10 GROUP BY cohortColumn )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "cohortTable",
        name: "cohortColumn"
      },
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })
  it("should build a negated SIMPLE FLOAT cohort", () => {
    const sql =
      "cohortColumn NOT IN ( SELECT cohortColumn FROM cohortTable WHERE foo = 10 GROUP BY cohortColumn )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "cohortTable",
        name: "cohortColumn",
        negated: true
      },
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })

  it("should build an EMPTY_COHORT", () => {
    const sql = "cohortColumn IN ( select some from sql GROUP BY cohortColumn )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "cohortTable",
        name: "cohortColumn"
      },
      filter: {
        filterType: FILTER_TYPE_EMPTY_COHORT,
        sql: "select some from sql"
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })

  it("should build a negated EMPTY_COHORT", () => {
    const sql =
      "cohortColumn NOT IN ( select some from sql GROUP BY cohortColumn )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "cohortTable",
        name: "cohortColumn",
        negated: true
      },
      filter: {
        filterType: FILTER_TYPE_EMPTY_COHORT,
        sql: "select some from sql"
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })

  it("should build a SIMPLE STR function filter", () => {
    const sql = "lowercase(foo) = 'bar'"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: {
        value: "foo",
        function: "lowercase",
        type: "SimpleAggregateFilterDataExpression"
      },
      dataType: "STR",
      operator: "=",
      value: "bar"
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })

  it("should build a SIMPLE FLOAT function filter", () => {
    const sql = "floor(foo) = 9"
    const filter = {
      filterType: FILTER_TYPE_SIMPLE,
      dataSource: "barTable",
      dataExpression: {
        value: "foo",
        function: "floor",
        type: "SimpleAggregateFilterDataExpression"
      },
      dataType: "FLOAT",
      operator: "=",
      value: 9
    }

    const builtSql = buildFilterSql([filter])
    expect(builtSql).toEqual([sql])
  })

  it("should build a SIMPLE FLOAT cohort with a post filter", () => {
    const sql =
      "cohortColumn IN ( SELECT cohortColumn FROM cohortTable WHERE foo = 10 GROUP BY cohortColumn HAVING count(*) = 100 )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "cohortTable",
        name: "cohortColumn",
        postFilters: [
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataSource: "barTable",
            dataExpression: {
              value: "*",
              function: "count",
              type: "SimpleAggregateFilterDataExpression"
            },
            operator: "=",
            value: 100
          }
        ]
      },
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "barTable",
        dataExpression: "foo",
        dataType: "FLOAT",
        operator: "=",
        value: 10
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })

  it("should build a sample cohort with post filter from FE-9684", () => {
    const sql =
      "tailnum IN ( SELECT tailnum FROM FLIGHTS WHERE dest_city = 'San Francisco' GROUP BY tailnum HAVING count(*) > 10 )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "FLIGHTS",
        name: "tailnum",
        postFilters: [
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataSource: "FLIGHTS",
            dataExpression: {
              value: "*",
              function: "count",
              type: "SimpleAggregateFilterDataExpression"
            },
            operator: ">",
            value: 10
          }
        ]
      },
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "FLIGHTS",
        dataExpression: "dest_city",
        dataType: "STR",
        operator: "=",
        value: "San Francisco"
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })

  it("should build a sample cohort with multiple post filters from FE-9684", () => {
    const sql =
      "tailnum IN ( SELECT tailnum FROM FLIGHTS WHERE dest_city = 'San Francisco' GROUP BY tailnum HAVING count(*) > 10 AND SUM(arrdelay) > 100 )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "FLIGHTS",
        name: "tailnum",
        postFilters: [
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataSource: "FLIGHTS",
            dataExpression: {
              value: "*",
              function: "count",
              type: "SimpleAggregateFilterDataExpression"
            },
            operator: ">",
            value: 10
          },
          {
            filterType: FILTER_TYPE_SIMPLE,
            dataSource: "FLIGHTS",
            dataExpression: {
              value: "arrdelay",
              function: "SUM",
              type: "SimpleAggregateFilterDataExpression"
            },
            operator: ">",
            value: 100
          }
        ]
      },
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "FLIGHTS",
        dataExpression: "dest_city",
        dataType: "STR",
        operator: "=",
        value: "San Francisco"
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })

  it("should build a sample cohort with multiple post filters via an AND filter from FE-9684", () => {
    const sql =
      "tailnum IN ( SELECT tailnum FROM FLIGHTS WHERE dest_city = 'San Francisco' GROUP BY tailnum HAVING (count(*) > 10 AND SUM(arrdelay) > 100) )"

    const filterMetadata = {
      applesTo: "GLOBAL",
      name: "test-filtermetadata",
      enabled: true,
      cohortDimension: {
        dataSource: "FLIGHTS",
        name: "tailnum",
        postFilters: [
          {
            filterType: FILTER_TYPE_AND,
            filters: [
              {
                filterType: FILTER_TYPE_SIMPLE,
                dataSource: "FLIGHTS",
                dataExpression: {
                  value: "*",
                  function: "count",
                  type: "SimpleAggregateFilterDataExpression"
                },
                operator: ">",
                value: 10
              },
              {
                filterType: FILTER_TYPE_SIMPLE,
                dataSource: "FLIGHTS",
                dataExpression: {
                  value: "arrdelay",
                  function: "SUM",
                  type: "SimpleAggregateFilterDataExpression"
                },
                operator: ">",
                value: 100
              }
            ]
          }
        ]
      },
      filter: {
        filterType: FILTER_TYPE_SIMPLE,
        dataSource: "FLIGHTS",
        dataExpression: "dest_city",
        dataType: "STR",
        operator: "=",
        value: "San Francisco"
      }
    }

    const builtSql = buildOmnifilterSql(filterMetadata)
    expect(builtSql).toEqual(sql)
  })
})
