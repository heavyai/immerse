// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import { call, put, select, getContext } from "redux-saga/effects"
import { expectSaga } from "redux-saga-test-plan"
import * as matchers from "redux-saga-test-plan/matchers"

import * as DashboardActions from "actions/dashboard-action-creators"
import * as DataSourceActions from "actions/data-source-action-creators"
import * as FilterActions from "actions/dashboard-filters-action-creators"
import { removeSelector } from "actions/charts-action-creators"
import { updateChart } from "actions/update-chart-action-creator"

import { handleDeleteChart, selectDataSourceSaga } from "./data-source-sagas"

import services from "services/immerse"

chai.use(spies)

describe("Data Source Sagas", () => {
  /* This test's assumption no longer holds -
     we are keeping data sources around for dashboard filters with no charts
  describe("handleDeleteChart saga", () => {
    it("should remove data sources that are not associated in any charts or filters", () => {
      return expectSaga(handleDeleteChart)
        .withState({
          connection: {
            isMSDEnabled: true
          },
          dashboard: {
            dataSources: {
              flights: {},
              tweets: {},
              contribs: {}
            }
          },
          filters: [{ dataSource: "tweets" }],
          charts: {
            1: {
              dataSource: "contribs"
            },
            2: {
              dataSource: "contribs"
            }
          }
        })
        .put(FilterActions.removeAllFiltersForSource("flights"))
        .put(DashboardActions.deleteDataSource("flights"))
        .run()
    })
  })
  */
  /*
  // updateChart now returns a thunk. This test needs to be updated
  describe("selectDataSourceSaga saga", () => {
    before(() => {
      services.set("crossfilter", {
        getCrossfilter: () => ({
          getColumns: () => []
        })
      })
    })

    it("should remove data sources that are not associated in any charts or filters", () => {
      const chartId = "1"

      return (
        expectSaga(selectDataSourceSaga, {
          chartId: { chartId },
          dataSource: "flights"
        })
          .withState({
            dashboard: {
              dataSources: {
                contribs: {}
              }
            },
            filters: [],
            charts: {
              [chartId]: {
                dimensions: [{ value: "s" }],
                measures: [{ value: "s" }],
                dataSource: "contribs"
              }
            }
          })
          .put(updateChart(chartId, { title: "" }))
          // .put(removeSelector(chartId, {type: "dimensions", index: 0}))
          // .put(removeSelector(chartId, {type: "measures", index: 0}))
          .put(DataSourceActions.setSource({ chartId }, "flights", []))
          .run()
      )
    })
  })
  */
})
