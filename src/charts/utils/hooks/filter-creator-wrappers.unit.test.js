// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  wrapAllFilterCreators,
  buildFiltersForColumn
} from "./filter-creator-wrappers"
import {
  nullFilter,
  notNullFilter,
  simpleFilter,
  betweenFilter,
  inFilter,
  notInFilter,
  polygonFilter,
  stPolygonFilter,
  distanceFilter,
  stDistanceFilter,
  boundingBoxFilter,
  notFilter,
  unlikelyFilter,
  andFilter,
  orFilter,
  sqlFilter,
  multiSourceFilter
} from "vega/constants/filter-types"

import {
  FILTER_TYPE_ISNULL,
  FILTER_TYPE_ISNOTNULL,
  FILTER_TYPE_SIMPLE,
  FILTER_TYPE_BETWEEN,
  FILTER_TYPE_IN,
  FILTER_TYPE_NOT_IN,
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
  FILTER_TYPE_SQL,
  FILTER_TYPE_MULTISOURCE
} from "vega/constants/filter-type-constants"

describe("Filter creator wrappers", () => {
  const tableDataSourceConfigs = [
    {
      describeTitle: "Table and datasource are the same",
      table: "testDataSource",
      dataSource: "testDataSource",
      dataExpression: "testDataExpression",
      dataType: "testDataType",
      value: "testValue"
    },
    {
      describeTitle: "Join datasource with a single table",
      dataSource: "${-1B3245JVDJ}",
      table: "table_from_join",
      dataExpression: "testDataExpression",
      dataType: "testDataType",
      value: "testValue"
    }
  ]

  tableDataSourceConfigs.forEach(
    ({ describeTitle, dataSource, table, dataExpression, dataType, value }) => {
      describe(describeTitle, () => {
        const filterDispatch = wrapAllFilterCreators({
          table,
          dataSource,
          dataExpression,
          dataType
        })

        it("can create null filter", () => {
          const vegaFilter = nullFilter(
            table,
            dataSource,
            dataExpression,
            dataType
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ISNULL]()

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create not null filter", () => {
          const vegaFilter = notNullFilter(
            table,
            dataSource,
            dataExpression,
            dataType
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ISNOTNULL]()

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create simple filter w/default operator", () => {
          const vegaFilter = simpleFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            "=",
            value
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_SIMPLE]({
            value
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create simple filter w/unwrapped value", () => {
          const vegaFilter = simpleFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            "=",
            value
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_SIMPLE](value)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create simple filter w/explicit operator", () => {
          const vegaFilter = simpleFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            ">=",
            value
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_SIMPLE]({
            operator: ">=",
            value
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create between filter", () => {
          const start = "START"
          const end = "END"
          const vegaFilter = betweenFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            start,
            end
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_BETWEEN]({
            start,
            end
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create between filter w/array", () => {
          const start = "START"
          const end = "END"
          const vegaFilter = betweenFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            start,
            end
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_BETWEEN]([
            start,
            end
          ])

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create in filter", () => {
          const values = ["a", "b", 2, 3]
          const vegaFilter = inFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            values
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_IN]({
            values
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create in filter w/array", () => {
          const values = ["a", "b", 2, 3]
          const vegaFilter = inFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            values
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_IN](values)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create not in filter", () => {
          const values = ["a", "b", 2, 3]
          const vegaFilter = notInFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            values
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_NOT_IN]({
            values
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create not in filter w/array", () => {
          const values = ["a", "b", 2, 3]
          const vegaFilter = notInFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            values
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_NOT_IN](values)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create polygon filter", () => {
          const poly = {
            latExpression: "testLatExpression",
            lonExpression: "testLonExpression",
            latDataType: "testLatDataType",
            lonDataType: "testLonDataType",
            points: [
              [1, 2],
              [3, 4]
            ]
          }
          const vegaFilter = polygonFilter(
            table,
            dataSource,
            poly.latExpression,
            poly.lonExpression,
            poly.latDataType,
            poly.lonDataType,
            poly.points
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_POLYGON](poly)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create stContains filter", () => {
          const polygon = [
            [1, 2],
            [3, 4]
          ]

          const vegaFilter = stPolygonFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            FILTER_TYPE_ST_CONTAINS,
            polygon
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ST_CONTAINS]({
            polygon
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create stContains filter w/unwrapped poly", () => {
          const polygon = [
            [1, 2],
            [3, 4]
          ]

          const vegaFilter = stPolygonFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            FILTER_TYPE_ST_CONTAINS,
            polygon
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ST_CONTAINS](polygon)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create stIntersects filter", () => {
          const polygon = [
            [1, 2],
            [3, 4]
          ]

          const vegaFilter = stPolygonFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            FILTER_TYPE_ST_INTERSECTS,
            polygon
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ST_INTERSECTS]({
            polygon
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create stIntersects filter w/unwrapped poly", () => {
          const polygon = [
            [1, 2],
            [3, 4]
          ]

          const vegaFilter = stPolygonFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            FILTER_TYPE_ST_INTERSECTS,
            polygon
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ST_INTERSECTS](
            polygon
          )

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create distance filter", () => {
          const dist = {
            latExpression: "testLatExpression",
            lonExpression: "testLonExpression",
            latDataType: "testLatDataType",
            lonDataType: "testLonDataType",
            point: [1, 2],
            distanceInMeters: 3
          }

          const vegaFilter = distanceFilter(
            table,
            dataSource,
            dist.latExpression,
            dist.lonExpression,
            dist.latDataType,
            dist.lonDataType,
            dist.point,
            dist.distanceInMeters
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_DISTANCE](dist)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create stDistance filter", () => {
          const point = [1, 2]
          const distanceInKM = 7

          const vegaFilter = stDistanceFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            point,
            distanceInKM
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_ST_DISTANCE]({
            point,
            distanceInKM
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create bounding box filter", () => {
          const bbox = {
            latExpression: "testLatExpression",
            lonExpression: "testLonExpression",
            latDataType: "testLatDataType",
            lonDataType: "testLonDataType",
            latMin: 0,
            latMax: 7,
            lonMin: 1,
            lonMax: 8
          }

          const vegaFilter = boundingBoxFilter(
            table,
            dataSource,
            bbox.latExpression,
            bbox.lonExpression,
            bbox.latDataType,
            bbox.lonDataType,
            bbox.latMin,
            bbox.latMax,
            bbox.lonMin,
            bbox.lonMax
          )
          const wrappedFilter = filterDispatch[FILTER_TYPE_BOUNDING_BOX](bbox)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create not filter", () => {
          const vegaFilter = simpleFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            "=",
            value
          )

          const notVegaFilter = notFilter(vegaFilter)

          const notWrappedFilter = filterDispatch[FILTER_TYPE_NOT](
            {
              value
            },
            filterDispatch[FILTER_TYPE_SIMPLE]
          )

          expect(notVegaFilter).toEqual(notWrappedFilter)
        })

        it("can create unlikely filter", () => {
          const vegaFilter = simpleFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            "=",
            value
          )

          const unlikelyVegaFilter = unlikelyFilter(vegaFilter)

          const unlikelyWrappedFilter = filterDispatch[FILTER_TYPE_UNLIKELY](
            {
              value
            },
            filterDispatch[FILTER_TYPE_SIMPLE]
          )

          expect(unlikelyVegaFilter).toEqual(unlikelyWrappedFilter)
        })

        it("can create sql filter", () => {
          const sql = "select foo from bar"
          const vegaFilter = sqlFilter(table, dataSource, sql, dataExpression)

          const wrappedFilter = filterDispatch[FILTER_TYPE_SQL]({
            sql
          })

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create sql filter w/unwrapped sql", () => {
          const sql = "select foo from bar"
          const vegaFilter = sqlFilter(table, dataSource, sql, dataExpression)

          const wrappedFilter = filterDispatch[FILTER_TYPE_SQL](sql)

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create and filter", () => {
          const vegaFilter = andFilter([
            simpleFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              "=",
              1,
              {
                dataTypeIsArray: false
              }
            ),
            simpleFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              "=",
              2,
              {
                dataTypeIsArray: false
              }
            ),
            betweenFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              3,
              4,
              {
                dataTypeIsArray: false
              }
            )
          ])

          const wrappedFilter = buildFiltersForColumn(
            {
              table: dataSource,
              type: dataType,
              value: dataExpression
            },
            { [FILTER_TYPE_AND]: [1, 2, { [FILTER_TYPE_BETWEEN]: [3, 4] }] },
            dataSource
          )

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create or filter", () => {
          const vegaFilter = orFilter([
            simpleFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              "=",
              1,
              {
                dataTypeIsArray: false
              }
            ),
            simpleFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              "=",
              2,
              {
                dataTypeIsArray: false
              }
            ),
            betweenFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              3,
              4,
              {
                dataTypeIsArray: false
              }
            )
          ])

          const wrappedFilter = buildFiltersForColumn(
            {
              dataSource,
              table: dataSource,
              type: dataType,
              value: dataExpression
            },
            { [FILTER_TYPE_OR]: [1, 2, { [FILTER_TYPE_BETWEEN]: [3, 4] }] },
            dataSource
          )

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create or filter w/array", () => {
          const vegaFilter = orFilter([
            simpleFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              "=",
              1,
              {
                dataTypeIsArray: false
              }
            ),
            simpleFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              "=",
              2,
              {
                dataTypeIsArray: false
              }
            ),
            betweenFilter(
              dataSource,
              dataSource,
              dataExpression,
              dataType,
              3,
              4,
              {
                dataTypeIsArray: false
              }
            )
          ])

          const wrappedFilter = buildFiltersForColumn(
            {
              dataSource,
              table: dataSource,
              type: dataType,
              value: dataExpression
            },
            [1, 2, { [FILTER_TYPE_BETWEEN]: [3, 4] }],
            dataSource
          )

          expect(vegaFilter).toEqual(wrappedFilter)
        })

        it("can create a build column filter for a simple value", () => {
          const wrappedFilter = buildFiltersForColumn(
            {
              table: dataSource,
              type: dataType,
              value: dataExpression
            },
            { [FILTER_TYPE_SIMPLE]: "foobar" },
            dataSource
          )

          const wrappedSimplerFilter = buildFiltersForColumn(
            {
              table: dataSource,
              type: dataType,
              value: dataExpression
            },
            "foobar",
            dataSource
          )

          expect(wrappedFilter).toEqual(wrappedSimplerFilter)
        })

        it("returns undefined for undefined value", () => {
          const wrappedFilter = buildFiltersForColumn(
            {
              table: dataSource,
              type: dataType,
              value: dataExpression
            },
            undefined,
            dataSource
          )

          expect(wrappedFilter).toEqual(undefined)
        })

        it("returns null filter for null value", () => {
          const wrappedFilter = buildFiltersForColumn(
            {
              table,
              type: dataType,
              value: dataExpression
            },
            null,
            dataSource
          )

          const validNullFilter = filterDispatch[FILTER_TYPE_ISNULL]({
            options: { dataTypeIsArray: false }
          })

          expect(wrappedFilter).toEqual(validNullFilter)
        })

        it("returns a pre-built filter if built", () => {
          const simpleValueFilter = filterDispatch[FILTER_TYPE_SIMPLE](value)
          const wrappedFilter = buildFiltersForColumn(
            {
              table,
              type: dataType,
              value: dataExpression
            },
            simpleValueFilter,
            dataSource
          )

          expect(wrappedFilter).toEqual(simpleValueFilter)
        })

        it("cannot build on an overly complex object", () => {
          expect(() => {
            buildFiltersForColumn(
              {
                table,
                type: dataType,
                value: dataExpression
              },
              { this: "will", fail: "now" },
              dataSource
            )
          }).toThrow("Must buildFiltersForColumn with single key object")
        })

        it("can build a multisource filter with a single source", () => {
          const simpleValueFilter = simpleFilter(
            table,
            dataSource,
            dataExpression,
            dataType,
            "=",
            1,
            {
              dataTypeIsArray: false
            }
          )

          const vegaFilter = multiSourceFilter({
            [dataSource]: simpleValueFilter
          })

          const wrappedFilter = buildFiltersForColumn(
            {
              table,
              type: dataType,
              value: dataExpression
            },
            { [FILTER_TYPE_MULTISOURCE]: 1 },
            dataSource
          )

          expect(vegaFilter).toEqual(wrappedFilter)
        })
      })
    }
  )
})
