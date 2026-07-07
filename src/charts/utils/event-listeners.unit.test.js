// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  binEventListener,
  setCustomContLegendListener,
  clearCustomContLegendListener,
  updateBinBoundsListener,
  createLabelUpdateFunction,
  createAxisDomainUpdateFunction,
  elasticXListener,
  elasticYListener
} from "./event-listeners"
import { setElasticY } from "actions/charts-action-creators"

import { updateColorLegend } from "../raster-chart/raster-chart-actions"

describe("Chart Event Listeners", () => {
  let dispatch = null
  let dcChart = null
  const id = 0
  describe("Filtered Event Listener", () => {
    const filters = [1, 2, 3]
    const rangeFilter = ["date1", "date2"]
    const areFiltersInverse = false
    /*
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        on: (event, action) => {
          action(null, "IL", areFiltersInverse)
        },
        filters: () => filters,
        range: () => ({
          filters: () => rangeFilter
        }),
        rangeChartEnabled: () => false
      }
    })
    // updateChart now returns a thunk. This test needs to be updated
    it("should dispatch update chart with new filters and range filter", () => {
      filteredListener({ id, dispatch }, dcChart, "eventEmitterName")
      expect(dispatch).toHaveBeenCalledWith(
        updateChart(id, { filters, areFiltersInverse, rangeFilter })
      )
    })
    it("should dispatch update chart with new filters", () => {
      dcChart.range = false
      filteredListener({ id, dispatch }, dcChart, "eventEmitterName")
      expect(dispatch).toHaveBeenCalledWith(
        updateChart(id, { filters, areFiltersInverse })
      )
    })
    */
  })

  describe("Bin EventListener Listener", () => {
    const timeBinInputVal = "auto"
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        on: (event, action) => {
          action(null, timeBinInputVal)
        }
      }
    })
    it("should dispatch update chart with Time Bin Input Value", () => {
      binEventListener({ id, dispatch }, dcChart, "eventEmitterName")
      expect(dispatch).toHaveBeenCalled()
    })
  })

  describe("Sort Event Listener", () => {
    const sortColumn = {
      col: {
        name: "val"
      },
      index: 1,
      order: "desc"
    }
    /*
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        on: (event, action) => {
          action(null, sortColumn)
        }
      }
    })
    // updateChart now returns a thunk. This test needs to be updated
    it("should dispatch update chart with new sort column data", () => {
      sortEventListener({ id, dispatch }, dcChart, "eventEmitterName")
      expect(dispatch).toHaveBeenCalledWith(updateChart(id, { sortColumn }))
    })
    */
  })

  describe("Set Custom Cont Legend Listener", () => {
    const eventData = {
      detail: [1, 1000]
    }
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        on: (event, action) => {
          action(null, eventData)
        }
      }
    })
    it("should dispatch update chart with colorDomain values", () => {
      setCustomContLegendListener({ id, dispatch }, dcChart)
      expect(dispatch).toHaveBeenCalledWith(
        updateColorLegend(id, { colorDomain: eventData.detail })
      )
    })
  })

  describe("Clear Custom Cont Legend Listener", () => {
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        on: (event, action) => {
          action()
        }
      }
    })
    it("should dispatch update chart with colorDomain value as NULL", () => {
      clearCustomContLegendListener(
        { id, dispatch },
        dcChart,
        "eventEmitterName"
      )
      expect(dispatch).toHaveBeenCalledWith(
        updateColorLegend(id, { colorDomain: null })
      )
    })
  })

  /*
  // updateChart now returns a thunk. This test needs to be updated
  describe("Save Position And Zoom Of Map", () => {
    const zoom = 3.1463812478493765
    const center = { lat: 52.06016278483918, lng: -108.13358423161988 }
    const bounds = { _ne: { lng: 0, lat: 0 }, _sw: { lng: 0, lat: 0 } }
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        map: () => ({
          on: (event, action) => {
            action()
          },
          getZoom: () => zoom,
          getCenter: () => center,
          getBounds: () => bounds
        })
      }
    })
    it("should not dispatch when id is 0 or null", () => {
      savePositionAndZoomOfMap({ id, dispatch }, dcChart, "eventEmitterName")
      expect(dispatch).to.have.not.been.called
    })
    it("should not dispatch and update chart when id is 1", () => {
      const validId = 1
      savePositionAndZoomOfMap(
        { id: validId, dispatch },
        dcChart,
        "eventEmitterName"
      )
      expect(dispatch).toHaveBeenCalledWith(
        updateChart(validId, {
          mapZoomCenter: {
            zoom,
            center,
            bounds: {
              lonMin: bounds._sw.lng,
              lonMax: bounds._ne.lng,
              latMin: bounds._sw.lat,
              latMax: bounds._ne.lat
            }
          }
        })
      )
    })
  })
  */

  /*
  describe("Get Closest Results And Hide Popup", () => {
    const hidePopupSpy = jest.fn()
    const getClosestResultSpy = jest.fn()
    beforeEach(() => {
      dispatch = jest.fn()
      dcChart = {
        map: () => ({
          on: (event, action) => {
            action({
              event: {
                point: [251, 125],
                displayPopup: true
              }
            })
          }
        }),
        hidePopup: hidePopupSpy,
        getClosestResult: getClosestResultSpy
      }
    })
  })
  */
  describe("updateBinBounds Event Listener", () => {
    let action = null
    const bounds = [0, 10]
    beforeEach(() => {
      dispatch = jest.fn((x) => {
        action = x
      })
    })
    it("should dispatch UPDATE_SELECTOR action", () => {
      updateBinBoundsListener(
        { id, dispatch },
        {
          on(name, listener) {
            listener({}, bounds)
          }
        }
      )
      expect(dispatch).toHaveBeenCalled()
      expect(action.type).toEqual("UPDATE_SELECTOR")
    })
  })
  describe("elasticX Event Listener", () => {
    let thunk = null
    beforeEach(() => {
      dispatch = jest.fn((x) => {
        thunk = x
      })
    })
    it("should dispatch setElasticX thunk", () => {
      elasticXListener(
        { id, dispatch },
        {
          on(name, listener) {
            listener({ elasticX: () => false })
          }
        }
      )
      expect(dispatch).toHaveBeenCalledWith(thunk)
    })
  })
  describe("elasticY Event Listener", () => {
    beforeEach(() => {
      dispatch = jest.fn()
    })
    it.skip("should dispatch setElasticY", () => {
      elasticYListener(
        { id, dispatch },
        {
          on(name, listener) {
            listener({ elasticY: () => false })
          }
        }
      )
      const call = dispatch.getCall(0)
      expect(call.args[0].toString()).toEqual(setElasticY(id, false).toString())
    })
  })
  describe("createAxisDomainUpdateFunction", () => {
    let action = null
    const domain = [0, 10]
    beforeEach(() => {
      dispatch = jest.fn((x) => {
        action = x
      })
    })
    it("create and eventListener function", () => {
      const createSetter = jest.fn()
      const updateListener = createAxisDomainUpdateFunction(
        "yDomain",
        "dimensions",
        0,
        createSetter
      )
      updateListener(
        { id, dispatch },
        {
          on(name, listener) {
            listener({}, domain)
          }
        }
      )
      expect(dispatch).toHaveBeenCalled()
      expect(action.type).toEqual("UPDATE_SELECTOR")
      expect(createSetter).toHaveBeenCalledWith(domain)
    })
  })
  describe("createLabelUpdateFunction", () => {
    let action = null
    const label = "foo"
    beforeEach(() => {
      dispatch = jest.fn((x) => {
        action = x
      })
    })
    it("create and eventListener function", () => {
      const createSetter = jest.fn()
      const updateListener = createLabelUpdateFunction(
        "yLabel",
        "dimensions",
        0,
        createSetter
      )
      updateListener(
        { id, dispatch },
        {
          on(name, listener) {
            listener({}, label)
          }
        }
      )
      expect(dispatch).toHaveBeenCalledWith(action)
      expect(createSetter).toHaveBeenCalledWith(label)
      expect(action.type).toEqual("UPDATE_SELECTOR")
    })
  })
})
