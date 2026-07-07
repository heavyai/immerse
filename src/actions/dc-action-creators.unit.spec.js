// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import action from "utils/redux/action"

import {
  chartRenderSuccess,
  removePointMapEventListeners,
  addPointMapEventListeners,
  resetSpecificDCState
} from "./dc-action-creators"

import {
  CHART_RENDER_SUCCESS,
  INITIAL_RENDER_DONE,
  RENDER_ALL_SUCCESS,
  RESET_SPECIFIC_DC_STATE
} from "constants/action-types"

chai.use(spies)

const services = new Map()
services.set("dc", {
  resetRedrawStack: () => {},
  renderAllAsync: () => new Promise((resolve) => resolve())
})
services.set("DbCon", {})

describe("DC Action Creators", () => {
  describe("chartRenderSuccess", () => {
    describe("when renderAll is still pending when initial render is done", () => {
      it("should only dispatch CHART_RENDER_SUCCESS", () => {
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
              pending: true
            }
          },
          charts: {}
        }
        const dispatch = sinon.spy()
        const thunk = chartRenderSuccess(1, 1, "1")
        thunk(dispatch, () => state, services)
        expect(dispatch).to.have.been.calledWith(
          action(CHART_RENDER_SUCCESS, { id: 1, dashboardId: 1, tabId: "1" })
        )
        expect(dispatch).to.have.not.been.calledWith(action(RENDER_ALL_SUCCESS))
        expect(dispatch).to.have.not.been.calledWith(
          action(INITIAL_RENDER_DONE)
        )
      })
    })
  })

  describe("removePointMapEventListeners", () => {
    const state = {
      charts: {
        1: {
          type: "pointmap"
        },
        2: {
          type: "line"
        },
        3: {
          type: "pointmap"
        }
      }
    }

    const removeMapListeners = sinon.spy()
    const addMapListeners = sinon.spy()

    const dc = {
      getChart: () => ({
        removeMapListeners,
        addMapListeners
      })
    }

    const services = new Map()
    services.set("dc", dc)

    it("should call removeMapListeners on all pointmaps that are not being edited", () => {
      const thunk = removePointMapEventListeners("1")
      thunk(null, () => state, services)
      expect(removeMapListeners).to.have.been.calledOnce
    })

    it("should call addMapListeners on all pointmaps that are not being edited", () => {
      const thunk = addPointMapEventListeners("1")
      thunk(null, () => state, services)
      expect(addMapListeners).to.have.been.calledOnce
    })
  })

  describe("resetSpecificDCState", () => {
    it("should return the correct actiont type", () => {
      expect(resetSpecificDCState().type).to.eql(RESET_SPECIFIC_DC_STATE)
    })
  })
})
