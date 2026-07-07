// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps } from "./multi-count"
import { routeToChartEditor } from "utils/routerPath"

import {
  FILTER_TYPE_OR,
  FILTER_TYPE_SIMPLE
} from "vega/constants/filter-type-constants"

describe("Multicount component", () => {
  describe("props mapper", () => {
    const defaultState = {
      chartEditor: { editId: null },
      charts: { 1: { dataSource: "flights" }, 2: { dataSource: "tweets" } },
      dashboard: { dataSources: { flights: {} }, currentDataSource: "flights" },
      dc: { initialRender: { done: true } },
      crossfilter: {},
      filterZones: {
        "-LqwE9KelPLDsOpbztjL": {
          id: "-LqwE9KelPLDsOpbztjL",
          name: "Default Filter Set",
          filters: ["-LqwJqD4ETsduPBhJ7r0"],
          selected: true,
          dimensions: {}
        }
      },
      omnifilters: [
        {
          appliesTo: "GLOBAL",
          name: "-LqwJqD4ETsduPBhJ7r0",
          enabled: true,
          dataSources: ["tweets"],
          filter: {
            filterType: FILTER_TYPE_OR,
            filters: [
              {
                filterType: FILTER_TYPE_SIMPLE,
                dataExpression: "country",
                dataSource: "tweets",
                dataType: "STR",
                operator: "=",
                value: "US"
              }
            ]
          }
        }
      ]
    }

    it("should map the correct chart edit source", () => {
      expect(
        mapStateToProps(defaultState, { location: { pathname: "/" } })
          .chartEditSource
      ).toEqual(false)

      expect(
        mapStateToProps(
          {
            ...defaultState
          },
          { location: { pathname: routeToChartEditor("heavyai", 1, 1) } }
        ).chartEditSource
      ).toEqual(false)

      expect(
        mapStateToProps(
          {
            ...defaultState,
            chartEditor: { editId: "1" }
          },
          { location: { pathname: routeToChartEditor("heavyai", 1, 1) } }
        ).chartEditSource
      ).toEqual("flights")
    })

    it("should map the correct current data soure", () => {
      expect(
        mapStateToProps(defaultState, { location: { pathname: "" } })
          .currentDataSource
      ).toEqual("flights")

      expect(
        mapStateToProps(
          {
            ...defaultState,
            dashboard: {
              dataSources: { tweets: {}, flights: {} },
              currentDataSource: null
            }
          },
          { location: { pathname: "/edit" } }
        ).currentDataSource
      ).toEqual("tweets")
    })
  })
})
