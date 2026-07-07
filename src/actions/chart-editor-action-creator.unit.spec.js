// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import proxyquire from "proxyquire"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import * as ActionTypes from "constants/action-types"
import { saveCurrentChart } from "./chart-editor-action-creators"
import { addMultiSourceAndOpenFold } from "./chart-editor-multisource-action-creators"

import dc from "services/dc"
import mockAppState from "utils/test-helpers/mock-app-state"

chai.use(spies)

const { maybeRevertChartToOldState } = proxyquire(
  "actions/chart-editor-action-creators",
  {
    "actions/charts-action-creators": {
      deleteChart: () => "deleteChart",
      resetChartState: () => "resetChartState",
      removeCountChart: () => "removeCountChart"
    },
    "actions/update-chart-type-action-creators": {
      updateChartType: () => "updateChartType"
    }
  }
)

describe("Chart Editor Action Creators", () => {
  describe("saveCurrentChart action creator", () => {
    it("should return an action with the SAVE_CURRENT_CHART type", () => {
      const chart = {
        type: "pie",
        measures: [],
        layers:[]
      }

      const id = "1"

      const action = saveCurrentChart(id, chart)

      const middlewares = [thunk]
      const mockStore = configureStore(middlewares)
      const store = mockStore(mockAppState)

      const expectedAction = {
        type: ActionTypes.SAVE_CURRENT_CHART,
        chartId: id,
        chart,
        filtersForChart: []
      }

      store.dispatch(action)
      expect(store.getActions()[0]).to.deep.equal(expectedAction)
    })
  })

  describe("maybeRevertChartToOldState", () => {
    let dispatch, id, chart, hasSaved, savedChart, savedFilters
    beforeEach(() => {
      dispatch = sinon.spy()
      id = "1"
      hasSaved = false
      chart = {
        type: "pie",
        measures: []
      }
      savedChart = {
        type: "pie",
        measures: []
      }
      savedFilters = []
    })
    it("should not call dispatch if chart is saving", () => {
      hasSaved = true
      maybeRevertChartToOldState(id, hasSaved, savedChart, chart, [])(dispatch, () => ({charts:{}}))
      expect(dispatch).to.have.not.been.called
    })

    it("should resetChartState when chart hasn not saved", () => {
      dc.chartRegistry.list().push({})
      maybeRevertChartToOldState(
        id,
        hasSaved,
        savedChart,
        chart,
        {},
        null,
        false,
        savedFilters
      )(dispatch, () => ({charts:{}}))
      expect(dispatch).to.have.been.calledWith("resetChartState")
      dc.chartRegistry.list().pop()
    })

    it("should resetChartState and updateChartType when chart has not saved AND chart type has changed", () => {
      chart.type = "row"
      dc.chartRegistry.list().push({})
      maybeRevertChartToOldState(
        id,
        hasSaved,
        savedChart,
        chart,
        {},
        null,
        false,
        savedFilters
      )(dispatch, () => ({charts:{}}))
      expect(dispatch).to.have.been.calledWith("resetChartState")
      dc.chartRegistry.list().pop()
    })

    it("should deleteChart if savedChart has no type (meaning it is a new chart)", () => {
      savedChart.type = undefined
      dc.chartRegistry.list().push({})
      maybeRevertChartToOldState(
        id,
        hasSaved,
        savedChart,
        chart,
        savedFilters
      )(dispatch, () => ({charts:{}}))
      expect(dispatch).to.have.been.calledWith("deleteChart")
      dc.chartRegistry.list().pop()
    })

    it("should removeCountChart when there is no corresponding datasource in savedDatasources", () => {
      chart.type = "row"
      dc.chartRegistry.list().push({})
      maybeRevertChartToOldState(
        id,
        hasSaved,
        savedChart,
        chart,
        { dataSources: {} },
        "taxi",
        false,
        savedFilters
      )(dispatch, () => ({charts:{}}))
      expect(dispatch).to.have.been.calledWith("removeCountChart")
      dc.chartRegistry.list().pop()
    })
  })

  describe("addMultiSourceAndOpenFold", () => {
    const chartId = 1

    it("should be able to add sources with index > 10", () => {
      const dispatchHook = (action) => {
        if (action.type === "ADD_MULTI_SOURCE") {
          expect(action.multiSourceIndex).to.eql(11)
        }
      }

      const getState = () => ({
        charts: {
          [chartId]: {
            multiSources: {
              "1": { index: "1" },
              "2": { index: "2" },
              "3": { index: "3" },
              "4": { index: "4" },
              "5": { index: "5" },
              "6": { index: "6" },
              "7": { index: "7" },
              "8": { index: "8" },
              "9": { index: "9" },
              "10": { index: "10" }
            }
          }
        }
      })

      addMultiSourceAndOpenFold(chartId)(dispatchHook, getState)
    })

    it("should throw an error with invalid indexes", () => {
      const dispatchHook = (action) => {}

      const getState = () => ({
        charts: {
          [chartId]: {
            multiSources: {
              asdf: { index: "asdf" }
            }
          }
        }
      })

      expect(() =>
        addMultiSourceAndOpenFold(chartId)(dispatchHook, getState)
      ).to.throw()
    })
  })
})
