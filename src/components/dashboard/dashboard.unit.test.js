// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, waitFor } from "@testing-library/react"
import withStoreContext from "utils/test-helpers/with-store-context"
import HeavyServicesProvider from "containers/heavy-services-provider"
import mockAppState from "utils/test-helpers/mock-app-state"
import Services from "services/immerse"
import history from "services/history"
import { Router } from "react-router-dom"

import Dashboard from "./dashboard"
import { createCrossfilterService } from "services/crossfilter"
import { paramState } from "components/parameters/parameter-mock-store"

jest.mock("components/chart-editor/chart-editor-parent", () => () => null)
jest.mock(
  "components/dashboard-top-panel/dashboard-top-panel-parent",
  () =>
    function MockDashboardTopPanelParent() {
      return <div className="dashboard-top-panel" />
    }
)

describe("Dashboard Component", () => {
  const defaultProps = {
    charts: {},
    dispatch: () => {},
    autosuggest: {},
    isConnected: true,
    chartContainers: [],
    parameterContainers: [],
    dashboardSpec: { filtersId: [] },
    filterZones: {},
    editing: false,
    path: "/",
    layout: [],
    match: {
      url: ""
    },
    location: {
      pathname: ""
    },
    params: {},
    parameters: paramState.parameters,
    handleUpdateDashboardName: () => {},
    chartRefs: { 1: {} },
    editId: "test-edit-id",
    pathname: "test-path-name",
    useCSSTransforms: false,
    isDashboardLoaded: false,
    isDashboardSaved: false,
    isPolyRasterEnabled: false,
    isMultiLayeringEnabled: false,
    saveState: { request: false, error: true, isSaved: false },
    size: {
      width: 400
    },
    dashboardPrivileges: {},
    showFilterPanelByDefault: false
  }

  const manager = createCrossfilterService()
  manager.setCrossfilter("flights", {})
  const services = new Map()
  services.set("crossfilter", manager)

  const state = Object.assign({}, mockAppState, {
    dashboard: Object.assign({}, mockAppState.dashboard, {
      table: "flights",
      chartContainers: [
        {
          id: "1",
          chartType: "pie"
        },
        {
          id: "2",
          chartType: "number"
        }
      ]
    })
  })

  const createDashboardElement = (props, appState = state, dispatch) =>
    withStoreContext(
      <HeavyServicesProvider services={services}>
        <Router history={history}>
          <Dashboard {...props} />
        </Router>
      </HeavyServicesProvider>,
      appState,
      dispatch,
      services
    )

  Services.set("crossfilter", { getCrossfilter: () => {} })

  describe("render", () => {
    it("should only return the DashboardTopPanel if not in the editor", () => {
      history.push("/dashboard/1")
      const { container, rerender } = render(
        createDashboardElement(defaultProps)
      )

      expect(container.querySelectorAll(".dashboard-top-panel")).toHaveLength(1)

      const editorProps = {
        ...defaultProps,
        editing: true,
        path: "/dashboard/1/chart/1/edit",
        params: {
          dashboardId: "1",
          chartId: "1"
        }
      }

      rerender(createDashboardElement(editorProps))

      expect(container.querySelectorAll(".dashboard-top-panel")).toHaveLength(0)
    })
  })

  describe("UNSAFE_componentWillReceiveProps", () => {
    it("should addPointMapEventListeners when switching from edit mode", () => {
      const dispatch = jest.fn()
      const props = { ...defaultProps, editing: true, dispatch }

      history.push("/dashboard/1")
      const { rerender } = render(
        createDashboardElement(props, state, dispatch)
      )

      const nextProps = { ...defaultProps, editing: false, dispatch }
      rerender(createDashboardElement(nextProps, state, dispatch))

      expect(dispatch).toHaveBeenCalledTimes(2)
    })

    it("should removePointMapEventListeners when switching to edit mode for an existing chart", () => {
      const dispatch = jest.fn()
      const fixtureCharts = { "1": {} }
      const initialProps = {
        ...defaultProps,
        charts: fixtureCharts,
        editing: false,
        dispatch
      }

      history.push("/dashboard/1")
      const { rerender } = render(
        createDashboardElement(initialProps, state, dispatch)
      )

      const nextProps = {
        ...defaultProps,
        charts: fixtureCharts,
        editing: true,
        editId: "1",
        dispatch
      }

      rerender(createDashboardElement(nextProps, state, dispatch))

      expect(dispatch).toHaveBeenCalledTimes(2)
    })

    it("should removePointMapEventListeners when switching to edit mode for a new chart", () => {
      const dispatch = jest.fn()
      const fixtureCharts = { "1": {} }
      const initialProps = {
        ...defaultProps,
        charts: fixtureCharts,
        editing: false,
        dispatch
      }

      history.push("/dashboard/1")
      const { rerender } = render(
        createDashboardElement(initialProps, state, dispatch)
      )

      const nextProps = {
        ...defaultProps,
        charts: fixtureCharts,
        editing: true,
        editId: "2",
        dispatch
      }

      rerender(createDashboardElement(nextProps, state, dispatch))

      expect(dispatch).toHaveBeenCalledTimes(1)
    })
  })

  describe("layout update", () => {
    it("should update layout with minW minH on load", async () => {
      const dispatch = jest.fn()
      history.push("/dashboard/1")
      render(
        createDashboardElement(
          {
            ...defaultProps,
            dispatch
          },
          state,
          dispatch
        )
      )

      await waitFor(() => {
        expect(dispatch).toHaveBeenCalled()
      })
    })
  })

  describe("resizing window", () => {
    it("should change rowHeight when window resize", () => {
      const dispatch = jest.fn()
      const dashboardRef = React.createRef()

      history.push("/dashboard/1")
      render(
        withStoreContext(
          <HeavyServicesProvider services={services}>
            <Router history={history}>
              <Dashboard
                {...defaultProps}
                dispatch={dispatch}
                ref={dashboardRef}
              />
            </Router>
          </HeavyServicesProvider>,
          state,
          dispatch,
          services
        )
      )

      const dashboardRoot = dashboardRef.current

      dashboardRoot.setState({ rowHeight: 12, colWidth: 32 })
      expect(dashboardRoot.state.rowHeight).toEqual(12)

      dashboardRoot.recalculateGridLayout()

      expect(dashboardRoot.state.rowHeight).toEqual(32)
    })
  })
})
