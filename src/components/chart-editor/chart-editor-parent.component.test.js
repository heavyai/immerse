// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import mockAppState from "utils/test-helpers/mock-app-state"
import {
  ChartEditorParent,
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  chartEditorParentSaveChart
} from "./chart-editor-parent"
import { setChartEditorToInitialState } from "actions/chart-editor-action-creators"
import { noop } from "utils/helpers"
import * as RasterActions from "charts/raster-chart/raster-chart-actions"
import chai, { expect } from "chai"
import sinon from "sinon"
import spies from "sinon-chai"
import { renderWithRedux } from "jest/renderScaffolding"

chai.use(spies)

const middlewares = [thunk]
const mockStore = configureStore(middlewares)({ ...mockAppState })

const defaultState = {
  dashboard: {
    dataSources: {},
    loadState: {}
  },
  connection: {
    isMSDEnabled: false
  },
  dc: {
    render: {
      error: false
    },
    redraw: {
      error: false
    }
  },
  chartEditor: {
    savedDataSources: { dataSources: {} },
    savedCharts: {
      1: {}
    },
    savedFilters: {
      1: []
    }
  },
  charts: {
    1: {
      color: { customDomain: ["default"] }
    }
  },
  ui: {
    selectorPillHover: { shouldShowPrompt: false, top: false }
  }
}

const defaultProps = {
  location: {
    pathname: "/dashboard/1/chart/1/edit"
  },
  match: {
    params: {
      chartId: "1"
    },
    isPolyRasterEnabled: false,
    isMultiLayeringEnabled: false,
    isRenderingEnabled: false
  }
}

function createWrapper(
  dispatch = noop,
  state = defaultState,
  props = defaultProps
) {
  const mergedProps = Object.assign(
    {},
    mergeProps(
      mapStateToProps(state, props),
      mapDispatchToProps(dispatch, props),
      props
    )
  )
  return <ChartEditorParent dispatch={dispatch} {...mergedProps} {...props} />
}

describe("ChartEditorParent Component", () => {
  let component = null

  beforeEach(() => {
    component = createWrapper()
  })

  it("should save current layer and show master when current layer is not master and there is more than one layer", () => {
    const dispatch = sinon.spy()
    component = createWrapper(
      dispatch,
      Object.assign({}, defaultState, {
        charts: {
          1: {
            type: "pointmap",
            color: { customDomain: ["default"] },
            currentLayer: 0,
            layers: [{}, {}],
            areFiltersInverse: false,
            isMultiLayeringEnabled: false,
            isPolyRasterEnabled: false
          }
        }
      })
    )
    chartEditorParentSaveChart(component.props)
    expect(dispatch).to.have.been.calledWith(
      RasterActions.saveCurrentRasterLayer("1", 0)
    )
    expect(dispatch).to.have.been.calledWith(
      RasterActions.saveCurrentRasterLayer("1", 0)
    )
    expect(dispatch).to.have.been.calledWith(
      RasterActions.combineRasterLayers("1")
    )
  })

  describe("componentWillUnmount", () => {
    it("should dispatch setChartEditorToInitialState", () => {
      const dispatch = sinon.spy()
      const wrapper = createWrapper(dispatch)
      const rendered = renderWithRedux(wrapper, mockStore, defaultState)
      rendered.unmount()
      expect(dispatch).to.have.been.calledWith(setChartEditorToInitialState())
    })
  })

  describe("redux actions", () => {
    describe("showMaster", () => {
      it("should save current layer and combine layers", () => {
        const dispatch = sinon.spy()
        const wrapper = createWrapper(dispatch)

        wrapper.props.showMaster("1", "0")
        expect(dispatch).to.have.been.calledWith(
          RasterActions.saveCurrentRasterLayer("1", "0")
        )
        expect(dispatch).to.have.been.calledWith(
          RasterActions.combineRasterLayers("1")
        )
      })
    })

    describe("switchLayer", () => {
      it("should save current layer and combine layers", () => {
        const dispatch = sinon.spy()
        const wrapper = createWrapper(dispatch)
        wrapper.props.switchLayer("1", "0", "1")
        expect(dispatch).to.have.been.calledWith(
          RasterActions.saveCurrentRasterLayer("1", "1")
        )
        expect(dispatch).to.have.been.calledWith(
          RasterActions.setRasterLayer("1", "0")
        )
      })
    })

    describe("saveCurrentLayer", () => {
      it("should save current layer and combine layers", () => {
        const dispatch = sinon.spy()
        const wrapper = createWrapper(dispatch)
        wrapper.props.saveCurrentLayer("1", "0")
        expect(dispatch).to.have.been.calledWith(
          RasterActions.saveCurrentRasterLayer("1", "0")
        )
      })
    })

    describe("addLayer", () => {
      it("should save current layer and combine layers", () => {
        const dispatch = sinon.spy()
        const wrapper = createWrapper(dispatch)
        wrapper.props.addLayer("1", "0")
        expect(dispatch).to.have.been.calledWith(
          RasterActions.saveCurrentRasterLayer("1", "0")
        )
        expect(dispatch).to.have.been.calledWith(
          RasterActions.addNewRasterLayer("1")
        )
      })
    })
  })
})
