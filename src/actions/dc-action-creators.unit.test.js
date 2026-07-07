// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import {
  chartRenderSuccess,
  handleAllChartsRendered
} from "actions/dc-action-creators"
import {
  CHART_RENDER_SUCCESS,
  INITIAL_RENDER_DONE,
  RENDER_ALL_SUCCESS
} from "constants/action-types"

const mockServices = new Map()
const mockDc = {
  resetRedrawStack: () => {},
  renderAllAsync: () => Promise.resolve()
}
mockServices.set("dc", mockDc)

const mockStore = configureStore([thunk.withExtraArgument(mockServices)])

const state = {
  dashboard: {
    table: "flights",
    id: 1,
    selectedTabId: "1"
  },
  dc: {
    initialRender: {
      done: false,
      numCharts: 2,
      counter: 2
    },
    renderAll: {
      pending: false
    }
  },
  charts: {}
}

describe("DC action creators", () => {
  describe("handleAllChartsRendered", () => {
    describe("when initial render is not done and counter equals num charts", () => {
      it("should dispatch RENDER_ALL_SUCCESS and INITIAL_RENDER_DONE", () => {
        const store = mockStore(state)
        store.dispatch(handleAllChartsRendered(1, 1, "1"))
        const actions = store.getActions()
        expect(actions[0].type).toEqual(RENDER_ALL_SUCCESS)
        expect(actions[1].type).toEqual(INITIAL_RENDER_DONE)
      })
    })
  })
  describe("chartRenderSuccess", () => {
    describe("when initial render is not done and counter equals num charts", () => {
      it("should dispatch CHART_RENDER_SUCCESS", () => {
        const store = mockStore(state)
        store.dispatch(chartRenderSuccess(1, 1, "1"))
        const actions = store.getActions()
        expect(actions[0].type).toEqual(CHART_RENDER_SUCCESS)
        expect(actions[0].id).toEqual(1)
        expect(actions[0].dashboardId).toEqual(1)
        expect(actions[0].tabId).toEqual("1")
      })
    })
  })
})
