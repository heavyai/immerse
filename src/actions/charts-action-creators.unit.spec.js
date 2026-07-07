// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const REDRAW_ALL = "REDRAW_ALL"

import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import proxyquire from "proxyquire"
import { CHARTS_DEFAULT_COLORS } from "constants/charts"
import { addCustomColorDomain } from "actions/charts-color-action-creators"
import { mergeR } from "utils/ramda-helpers"
import { keys } from "ramda"
import { createCrossfilterService } from "services/crossfilter"

chai.use(spies)

import {
  ADD_MEASURE,
  CREATE_CHART,
  UPDATE_CHART,
  CLEAR_CHARTS,
  DELETE_CHART,
  REMOVE_SELECTOR,
  CLEAR_SELECTOR,
  SET_SELECTOR_ERROR,
  SET_CHART_HAS_ERROR,
  UPDATE_CHART_TYPE,
  CLEAR_CHART_FILTERS_FOR_ALL_CHARTS,
  UPDATE_SELECTOR,
  SWAP_SELECTORS,
  DISCARD_INACTIVE_SELECTORS
} from "constants/action-types"

import {
  addMeasure,
  discardInactiveSelectors,
  setDimensionBinning,
  setSelectorError,
  swapSelectors,
  updateSelectorAction
} from "actions/selector-action-creators"
import { updateChartType } from "actions/update-chart-type-action-creators"


const lineDimensionUpdateMethodSpy = sinon.spy()

const {
  addCustomColor,
  addDimension,
  createChart,
  clearCharts,
  deleteChart,
  clearSelector,
  removeSelector,
  addSelector,
  clearChartFilters,
  setChartHasError,
  shouldDestroyWhenRemoving,
  clearChartFiltersForAllCharts,
  updateSelector,
  removeCustomColor,
  setCustomColor,
  setCustomDefaultOtherColorValue,
  toggleOtherMultiSeries,
  resetChartState,
  updateTimeBinInputVal,
  setElasticX,
  updateBinBoundsVal,
  destroyChart
} = proxyquire("actions/charts-action-creators", {
  "actions/dc-action-creators": {
    redrawAll: () => REDRAW_ALL
  },
  "charts/line": {
    lineDimensionUpdateMethod: lineDimensionUpdateMethodSpy
  }
})

const getState = type => _ => ({
  dc: {
    initialRender: {
      done: true,
      pending: false,
      error: false,
      numCharts: 2,
      counter: 2
    },
    render: {},
    redraw: {}
  },
  charts: {
    0: {
      dcFlag: 0,
      dimensions: [{}],
      measures: [],
      type: type || "pie",
      hasError: true
    },
    1: {
      dcFlag: 1,
      dimensions: [{}],
      measures: [{ name: "color" }],
      type: type || "pie",
      hasError: true
    }
  }
})

describe("Charts Actions", () => {
  const services = new Map()
  let connector
  let crossfilter
  let dispatch
  let dc
  let chart
  let charts
  let state
  let selected
  let showOther
  let binParams
  let rangeChartEnabled
  let filters

  function setupChart() {
    return {
      filter: sinon.spy(() => filters),
      binParams: binParams,
      on: sinon.spy(),
      filterAll: sinon.spy(),
      resetSvg: sinon.spy(),
      destroyChart: sinon.spy(),
      sortColumn: sinon.spy(),
      elasticX: sinon.spy(),
      rangeChartEnabled: sinon.spy(() => rangeChartEnabled),
      rangeChart: sinon.spy(() => chart),
      xOriginalDomain: sinon.spy(),
      x: sinon.spy(() => ({
        domain: () => ({
          slice: () => sinon.spy()
        })
      })),
      dimension: () => ({ getFilter: () => "" }),
      isCountChart: () => true,
      isMulti: () => true,
      series: () => ({
        selected: () => selected
      }),
      showOther: other => (other ? (showOther = other) : showOther),
      renderAsync: sinon.spy(() => Promise.resolve()),
      redrawAsync: sinon.spy(() => Promise.resolve()),
      filters: sinon.spy(() => []),
      filtersInverse: sinon.spy(() => false)
    }
  }

  async function run(thunk) {
    const middlewareContext = a => {
      if (typeof a === "function") {
        return a(middlewareContext, () => state, services)
      } else {
        return dispatch(a)
      }
    }
    services.set("dc", dc)
    services.set("crossfilter", crossfilter)
    services.set("DbCon", connector)
    return await thunk(middlewareContext, () => state, services)
  }

  function chartHasBeenRemoved(id, chartSpec) {
    expect(dc.getChart).to.have.been.calledWith(state.charts[id].dcFlag)
    expect(dc.chartRegistry.deregister).to.have.been.calledWith(chartSpec)
    expect(chart.on).to.have.been.calledWith("filtered", null)
    expect(chart.filterAll).to.have.been.called
    expect(chart.resetSvg).to.have.been.called
    expect(chart.destroyChart).to.have.been.called
  }

  function chartHasNotBeenRemoved(id, chartSpec) {
    expect(dc.getChart).to.have.not.been.calledWith(state.charts[id].dcFlag)
    expect(dc.chartRegistry.deregister).to.have.not.been.calledWith(chartSpec)
    expect(chart.on).to.have.not.been.calledWith("filtered", null)
    expect(chart.filterAll).to.have.not.been.called
    expect(chart.resetSvg).to.have.not.been.called
    expect(chart.destroyChart).to.have.not.been.called
  }

  beforeEach(() => {
    dispatch = sinon.spy()
    binParams = sinon.spy(() => [{}])
    chart = setupChart()
    connector = {

    }
    crossfilter = {
      dimension: () => ({
        order: () => ({
          group: () => ({
            reduceCount: () => ({
              topAsync: sinon.spy(
                () =>
                  new Promise(resolve =>
                    resolve([{ key0: "US" }, { key0: "CA" }, { key0: "BR" }])
                  )
              )
            })
          })
        })
      }),
      groupAll: () => ({
        reduce: () => ({
          valuesAsync: sinon.spy(
            () => new Promise(resolve => resolve({ minimum: 1, maximum: 5 }))
          )
        })
      }),
      getMinMax: () => new Promise(resolve => resolve([0, 5])),
      getGlobalFilter: () => [],
      getCrossfilter: () => crossfilter
    }
    charts = [setupChart(), setupChart()]
    dc = {
      chartRegistry: {
        deregister: sinon.spy(),
        list: () => charts,
        listAll: () => charts
      },
      redrawAllAsync: sinon.spy(() => Promise.resolve()),
      getChart: sinon.spy(() => chart)
    }
    selected = ["ATL", "SFO", "IAD", "OAK"]
    state = {
      dc: {
        initialRender: {
          done: true,
          pending: false,
          error: false,
          numCharts: 5,
          counter: 5
        },
        render: {},
        redraw: {},
        renderAll: {
          done: true
        }
      },
      dashboard: {
        table: "flights"
      },
      charts: {
        1: {
          type: "table",
          dcFlag: 2,
          dimensions: [{}, { name: "airtime" }],
          measures: [{ name: "val" }, { name: "color" }],
          filters: [],
          rangeFilter: [],
          sortColumn: {
            col: {
              name: "color"
            },
            index: 1,
            order: "asc"
          },
          hasError: true
        },
        2: {
          type: "table",
          dcFlag: 2,
          dimensions: [{}, { name: "airtime" }],
          measures: [{ name: "val" }, { name: "color" }],
          filters: [],
          rangeFilter: [],
          sortColumn: null
        },
        3: {
          type: "table",
          dcFlag: 3,
          dimensions: [{ name: "key0" }],
          measures: [{ name: "col0" }, { name: "col1" }],
          filters: [],
          rangeFilter: [],
          sortColumn: {
            col: {
              name: "col1"
            },
            index: 2,
            order: "asc"
          }
        },
        4: {
          type: "table",
          dcFlag: 4,
          dimensions: [
            { name: "key0", inactive: false },
            { name: "key1", inactive: false }
          ],
          measures: [{ name: "col0" }, { name: "col1" }],
          filters: [],
          rangeFilter: [],
          sortColumn: {
            col: {
              name: "col0"
            },
            index: 1,
            order: "asc"
          },
          color: {
            customDomain: []
          }
        },
        5: {
          type: "line",
          dimensions: [
            { name: "key0", inactive: false },
            { name: "key1", inactive: false }
          ],
          dcFlag: 5,
          color: {
            customDomain: []
          }
        }
      }
    }
  })

  describe("createChart", () => {
    it("should return proper type and id in payload", () => {
      const action = createChart("1", "tweets")
      expect(action).to.deep.equal({
        type: CREATE_CHART,
        dataSource: "tweets",
        chartId: "1",
        defaults: undefined
      })
    })
  })

  /*
  // updateChart now returns a thunk
  describe("updateChart", () => {
    it("should return id, proper type, and params in payload", () => {
      const action = updateChart("1", { ticks: 3 })
      expect(action).to.deep.equal({
        chartId: "1",
        type: UPDATE_CHART,
        payload: { ticks: 3 }
      })
    })
  }) */

  describe("clearCharts", () => {
    it("should return CLEAR_CHART type", () => {
      const action = clearCharts()
      expect(action).to.deep.equal({
        type: CLEAR_CHARTS
      })
    })
  })

  describe("deleteChart", () => {
    it("should return action with proper type and payload", async () => {
      await run(deleteChart("1"))
      chartHasBeenRemoved("1", chart)
      expect(dispatch).to.have.been.calledWith({
        type: DELETE_CHART,
        chartId: "1"
      })
      expect(dispatch).to.have.not.been.calledWith(REDRAW_ALL)
    })
    it("should not destroy chart if no chart exists", async () => {
      state = {
        dc: {
          renderAll: {
            done: true
          }
        },
        charts: {}
      }
      await run(deleteChart("1"))
      expect(dispatch).to.have.not.been.called
    })

    /*

    tests are now wonky after behavior change in 5643: needs to be re-visited.

    it("should dispatch redrawAll if there are filters", () => {
      state = {
        dc: {
          renderAll: {
            done: true
          }
        },
        charts: {
          1: {
            dcFlag: 2,
            filters: [0]
          }
        }
      }
      run(deleteChart("1"))
      expect(dispatch).to.have.been.calledWith(REDRAW_ALL)
    })
    it("should dispatch redrawAll if chart is pointmap", () => {
      state = {
        dc: {
          renderAll: {
            done: true
          }
        },
        charts: {
          1: {
            type: "pointmap",
            dcFlag: 2,
            filters: [0]
          }
        }
      }
      run(deleteChart("1"))
      expect(dispatch).to.have.been.calledWith(REDRAW_ALL)
    })*/
  })

  describe("removeSelector", () => {
    it("should return an action of the REMOVE_SELECTOR type", async () => {
      const id = "1"
      await run(removeSelector(id, { type: "measures", index: 0 }))
      expect(dispatch).to.have.been.calledWith({
        type: REMOVE_SELECTOR,
        chartId: "1",
        selectorType: "measures",
        selectorIndex: 0
      })
    })

    it("should remove sorting if chart is sorted by selector", async () => {
      const id = "1"
      await run(removeSelector(id, { type: "measures", index: 1 }))
      expect(dispatch).to.have.been.calledWith({
        type: "UPDATE_CHART",
        chartId: "1",
        payload: { sortColumn: null }
      })
      expect(dispatch).to.have.been.calledWith({
        type: "REMOVE_SELECTOR",
        chartId: "1",
        selectorType: "measures",
        selectorIndex: 1
      })
    })

    it("should do nothing if chart has no sorting", async () => {
      const id = "2"
      await run(removeSelector(id, { type: "measures", index: 1 }))
      expect(dispatch).to.have.been.calledWith({
        type: "REMOVE_SELECTOR",
        chartId: "2",
        selectorType: "measures",
        selectorIndex: 1
      })
    })

    it("should fix sorting if selector removal causes offset", async () => {
      const id = "3"
      const newSort = {
        col: {
          name: "col0"
        },
        index: 1,
        order: "asc"
      }
      await run(removeSelector(id, { type: "measures", index: 0 }))
      expect(dispatch).to.have.been.calledTwice
    })

    it("should do nothing to sorting if selector removal causes no offset", async () => {
      const id = "4"
      await run(removeSelector(id, { type: "measures", index: 1 }))
      expect(dispatch).to.have.been.called
    })

    it("should tear down chart if selector type is dimensions", async () => {
      const id = "1"
      await run(removeSelector(id, { type: "dimensions", index: 0 }))
      chartHasBeenRemoved("1", chart)
    })

    it("should remove preRedraw.color handlers if selector removed is color", async () => {
      const id = "1"
      await run(removeSelector(id, { type: "measures", index: 1 }))
      expect(chart.on).to.have.been.calledWith("preRender.color", null)
      expect(chart.on).to.have.been.calledWith("preRedraw.color", null)
    })
  })

  describe("clearSelector", () => {
    it("should return an action of the REMOVE_SELECTOR type", async () => {
      const id = "1"
      await run(clearSelector(id, { type: "measures", index: 0 }))
      expect(dispatch).to.have.been.calledWith({
        type: CLEAR_SELECTOR,
        chartId: "1",
        selectorType: "measures",
        selectorIndex: 0
      })
    })

    it("should tear down chart if selector type is dimensions", async () => {
      const id = "1"
      await run(clearSelector(id, { type: "dimensions", index: 0 }))
      chartHasBeenRemoved("1", chart)
    })
  })

  describe("updateSelector", () => {
    it("should return an action of the UPDATE_SELECTOR type", () => {
      const id = "1"
      const setter = a => a
      const thunk = updateSelector(id, "measures", 0, setter)
      thunk(dispatch, getState())
      expect(dispatch).to.have.been.calledWith({
        type: UPDATE_SELECTOR,
        chartId: "1",
        selectorType: "measures",
        selectorIndex: 0,
        setter
      })
    })

    // this test needs to be updated: clearChartFilters now returns a thunk
    /* it("should call clearChartFilters if selector type is dimensions", () => {
      const id = "1"
      const thunk = updateSelector(id, "dimensions", 0, a => a)
      thunk(dispatch, getState())
      expect(dispatch).to.have.been.calledWith(clearChartFilters(id))
    }) */

    it("should call dispatch twice if selector is measure and chartType is pie", async () => {
      const id = "1"
      state.charts["1"].type = "pie"
      await run(updateSelector(id, "measures", 1, a => a))
      expect(dispatch).to.have.been.calledTwice
    })
  })

  describe("swapSelectors", () => {
    it("should return a function that returns an action of the SWAP_SELECTOR typ", () => {
      const thunk = swapSelectors("1", "measures")
      const action = thunk(0, 1)

      expect(action).to.deep.equal({
        type: SWAP_SELECTORS,
        chartId: "1",
        selectorType: "measures",
        dragIndex: 1,
        hoverIndex: 0
      })
    })
  })

  describe("addSelector", () => {
    describe("for number chart", () => {
      it("should destroyChart", async () => {
        state = {
          charts: {
            1: {
              type: "number",
              dcFlag: 2,
              filters: [],
              rangeFilter: [],
              dimensions: {},
              measures: {}
            }
          },
          dc: {
            render: {},
            redraw: {}
          }
        }
        await run(addSelector("measures")("1", "number", 0, {}))
        chartHasBeenRemoved("1", chart)
      })
    })

    // this test needs to be updated - clearChartFilters now returns a thunk
    /*
    describe("for dimensions", () => {
      beforeEach(() => {
        services.set("crossfilter", crossfilter)
      })
      it("should dispatch clearChartFilters", () => {
        const id = 1
        const addDimension = addSelector("dimensions")
        run(addDimension(id, "table", 1, {}))
        chartHasBeenRemoved("1", chart)
      })
    }) */

    describe("for measures", () => {
      beforeEach(() => {
        services.set("crossfilter", crossfilter)
      })

      it("dispatches # Records as a quantitative measure", done => {
        return runTest()
        function runTest() {
          return addMeasure(0, 1, { value: "*" })(
            dispatchAction,
            getState(),
            services
          )
        }
        function dispatchAction(action) {
          expect(
            services
              .get("crossfilter")
              .groupAll()
              .reduce().valuesAsync
          ).to.have.not.been.called
          expect(
            services
              .get("crossfilter")
              .dimension()
              .order()
              .group()
              .reduceCount().topAsync
          ).to.have.not.been.called
          expect(action.measure).to.deep.equal({
            value: "*",
            colorType: "quantitative"
          })
          done()
        }
      })

      it("marks quantitative measure with quantitative colorType", done => {
        return runTest()
        function runTest() {
          return addMeasure(1, 0, { type: "SMALLINT" })(
            dispatchAction,
            getState(),
            services
          )
        }
        function dispatchAction(action) {
          expect(action.measure.colorType).to.eql("quantitative")
          done()
        }
      })

      it("marks ordinal measure with quantitative colorType (b/c count unique)", done => {
        return runTest()
        function runTest() {
          return addMeasure(1, 0, { type: "STR" })(
            dispatchAction,
            getState(),
            services
          )
        }
        function dispatchAction(action) {
          expect(action.measure.colorType).to.eql("quantitative")
          done()
        }
      })

      it("marks pointmap quantitative measure with quantitative colorType", done => {
        state.charts[1].type = "pointmap"
        return runTest()
        function runTest() {
          return addMeasure(1, 0, { type: "INT" })(
            dispatchAction,
            getState(),
            services
          )
        }
        function dispatchAction(action) {
          expect(action.measure.colorType).to.eql("quantitative")
          done()
        }
      })

      it("does not get minMax for quantitative non-pointmap measures", done => {
        return runTest()
        function runTest() {
          return addMeasure(1, 0, { type: "INT" })(
            dispatchAction,
            getState(),
            services
          )
        }
        function dispatchAction(action) {
          expect(action.measure.minMax).to.be.undefined
          done()
        }
      })

      it("does not get top categories for ordinal non-pointmap measures", done => {
        return runTest()
        function runTest() {
          return addMeasure(1, 1, { type: "STR" })(
            dispatchAction,
            () => state,
            services
          )
        }
        function dispatchAction(action) {
          expect(action.measure.categories).to.be.undefined
          done()
        }
      })

      it("does not get top categories for pointmap ordinal non-color measures", done => {
        state.charts[1].type = "pointmap"
        return runTest()
        function runTest() {
          return addMeasure(1, 0, { type: "STR" })(
            dispatchAction,
            () => state,
            services
          )
        }
        function dispatchAction(action) {
          expect(action.measure.categories).to.be.undefined
          done()
        }
      })
    })

    describe("setChartHasError", () => {
      it("should return SET_CHART_HAS_ERROR action", () => {
        expect(setChartHasError("1", "error")).to.deep.equal({
          type: SET_CHART_HAS_ERROR,
          chartId: "1",
          error: "error"
        })
      })
    })

    describe("setSelectorError", () => {
      it("should return SET_SELECTOR_ERROR action", () => {
        expect(
          setSelectorError("1", { index: 0, type: "dimensions" })
        ).to.deep.equal({
          type: SET_SELECTOR_ERROR,
          index: 0,
          chartId: "1",
          selectorType: "dimensions"
        })
      })
    })

    describe("updateChartType", () => {
      it("should be called with the correction action", async () => {
        await run(updateChartType("1", "pie"))
        expect(dispatch).to.have.been.calledWith({
          type: UPDATE_CHART_TYPE,
          chartId: "1",
          chartType: "pie"
        })
      })

      // this test needs to be updated - clearChartFilters now returns a thunk
      /*
      describe("clearChartFiltersForAllCharts", () => {
        it("should clear filters and redrawAllAsync", () => {
          run(clearChartFiltersForAllCharts())
          charts.forEach(chart => {
            expect(chart.filterAll).to.have.been.called
          })
          expect(dispatch).to.have.been.calledWith({
            type: CLEAR_CHART_FILTERS_FOR_ALL_CHARTS
          })
          expect(dispatch).to.have.been.calledWith(REDRAW_ALL)
        })
      }) */

      describe("discardInactiveSelectors", () => {
        it("should return DISCARD_INACTIVE_SELECTORS action", () => {
          expect(discardInactiveSelectors("1")).to.deep.equal({
            type: DISCARD_INACTIVE_SELECTORS,
            chartId: "1"
          })
        })
      })
    })

    describe("removeSelector", () => {
      it("should handle when is multi-series chart", async () => {
        await run(removeCustomColor(5, 2))
        expect(dispatch).to.have.been.calledWith({
          type: "REMOVE_CUSTOM_COLOR",
          chartId: 5,
          index: 2
        })
      })

      it("should dispatch REMOVE_CUSTOM_COLOR action", async () => {
        await run(removeCustomColor(4, 2))
        expect(dispatch).to.have.been.calledWith({
          type: "REMOVE_CUSTOM_COLOR",
          chartId: 4,
          index: 2
        })
      })
    })

    describe("setCustomColor", () => {
      it("should handle when is multi-series chart", () => {
        expect(setCustomColor(5, 2, "DCA", "customDomain")).to.deep.equal({
          type: "SET_CUSTOM_COLOR",
          chartId: 5,
          index: 2,
          value: "DCA",
          key: "customDomain",
          multiSourceIndex: undefined
        })
      })

      it("should handle when is multi-series chart and selected index does not exist", () => {
        expect(setCustomColor(5, 4, "DCA", "customDomain")).to.deep.equal({
          type: "SET_CUSTOM_COLOR",
          chartId: 5,
          index: 4,
          value: "DCA",
          key: "customDomain",
          multiSourceIndex: undefined
        })
      })

      it("should dispatch SET_CUSTOM_COLOR action", () => {
        expect(setCustomColor(4, 2, "DCA", "customDomain")).to.deep.equal({
          type: "SET_CUSTOM_COLOR",
          chartId: 4,
          index: 2,
          value: "DCA",
          key: "customDomain",
          multiSourceIndex: undefined
        })
      })
    })

    describe("shouldDestroyWhenRemoving", () => {
      it("should not destroy a chart if it is inactive dimension", () => {
        const selector = {
          index: 0,
          type: "dimensions"
        }
        const chart = {
          dimensions: {
            "0": {
              inactive: true
            }
          },
          type: "pointmap"
        }
        const result = shouldDestroyWhenRemoving(chart, selector)
        expect(result).to.eql(false)
      })
    })

    describe("setCustomDefaultOtherColorValue", () => {
      it("should handle when is multi-series chart", () => {
        expect(
          setCustomDefaultOtherColorValue(5, "DCA", "defaultOtherDomain")
        ).to.deep.equal({
          type: "SET_CUSTOM_DEFAULT_OTHER_COLOR",
          chartId: 5,
          value: "DCA",
          key: "defaultOtherDomain",
          noSave: false
        })
      })

      it("should handle when is multi-series chart and selected index does not exist", () => {
        expect(
          setCustomDefaultOtherColorValue(5, "DCA", "defaultOtherDomain")
        ).to.deep.equal({
          type: "SET_CUSTOM_DEFAULT_OTHER_COLOR",
          chartId: 5,
          value: "DCA",
          key: "defaultOtherDomain",
          noSave: false
        })
      })

      it("should dispatch SET_CUSTOM_DEFAULT_OTHER_COLOR action", () => {
        expect(
          setCustomDefaultOtherColorValue(4, "DCA", "defaultOtherDomain")
        ).to.deep.equal({
          type: "SET_CUSTOM_DEFAULT_OTHER_COLOR",
          chartId: 4,
          value: "DCA",
          key: "defaultOtherDomain",
          noSave: false
        })
      })
    })
  })

  describe("toggleOtherMultiSeries", () => {
    it("toggles other in dc chart", async () => {
      await run(toggleOtherMultiSeries(1))
      expect(dc.getChart).to.have.been.called
      expect(dispatch).to.have.been.calledWith({
        type: "TOGGLE_OTHER",
        chartId: 1
      })
    })
  })

  describe("addCustomColorDomain", () => {
    it("should return the correct action type", () => {
      expect(
        addCustomColorDomain("1", "recipient_party", [], "Default")
      ).to.deep.equal({
        type: "ADD_CUSTOM_COLOR_DOMAIN",
        chartId: "1",
        column: "recipient_party",
        domain: [],
        defaultOtherDomain: "Default"
      })
    })
  })

  describe("resetChartState", () => {
    it("should", async () => {
      await run(resetChartState(1, { dcFlag: 0, filters: [1] }))
      expect(dc.getChart).to.have.been.called
      expect(chart.filter).to.have.been.called
      // expect(dispatch).to.have.been.calledWith(
      //   updateChart(1, { dcFlag: 0, filters: [1] })
      // )
    })
  })
  describe("updateSelectorAction", () => {
    const setter = () => null
    it("should return the correct action signature", () => {
      expect(updateSelectorAction("1", "dimensions", 0, setter)).to.deep.equal({
        chartId: "1",
        selectorIndex: 0,
        selectorType: "dimensions",
        setter,
        type: "UPDATE_SELECTOR"
      })
    })
  })
  describe("updateBinBoundsVal", () => {
    it("dispatches UPDATE_SELECTOR action", () => {
      const update = updateBinBoundsVal("5", 1, [10, 20])
      const updatedSelector = update.setter({})
      expect(update.type).to.eq("UPDATE_SELECTOR")
      expect(updatedSelector.currentLowValue).to.eq(10)
      expect(updatedSelector.currentHighValue).to.eq(20)
    })
  })
  describe("addCustomColor", () => {
    it("should return the correct action signature", () => {
      expect(addCustomColor("1", "color")).to.deep.equal({
        chartId: "1",
        type: "ADD_CUSTOM_COLOR",
        value: "color"
      })
    })
  })

  describe("setElasticX", () => {
    it("should set elasticX on a chart and call redrawAsync", async () => {
      await run(setElasticX("5", true))
      expect(dc.getChart).to.have.been.calledWith(state.charts["5"].dcFlag)
      expect(dispatch).to.have.been.calledWith({
        type: "SET_ELASTICX",
        chartId: "5",
        value: true
      })
      expect(chart.elasticX).to.have.been.calledWith(true)
      expect(chart.redrawAsync).to.have.been.called
      expect(dispatch).to.have.been.called
    })
    it("should set elasticX on rangeChart if rangeChartEnabled and call redrawAsync", async () => {
      rangeChartEnabled = true
      await run(setElasticX("5", false))
      expect(chart.rangeChart).to.have.been.called
      expect(chart.elasticX).to.have.been.calledWith(false)
      expect(chart.redrawAsync).to.have.been.called
    })
  })
})
