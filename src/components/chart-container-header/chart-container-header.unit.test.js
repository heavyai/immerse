// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import ChartContainerHeader, {
  mapStateToProps,
  mapDispatchToProps
} from "./chart-container-header"
import { renderWithRedux } from "jest/renderScaffolding"

describe("Chart Container Header", () => {
  const props = {
    id: "1",
    editId: "a real id, seriously"
  }

  const state = {
    omnifilters: [],
    chartEditor: {
      editId: null
    },
    charts: {
      1: {
        dataSource: "flights",
        type: "line",
        layers: [],
        title: "foo",
        filters: [],
        rangeFilter: [],
        linkedZoomEnabled: false
      },
      2: {
        dataSource: null,
        type: "text",
        layers: [],
        title: "",
        filters: [],
        rangeFilter: [],
        linkedZoomEnabled: false
      }
    },
    dashboard: {
      dataSources: {
        flights: {
          alias: "A"
        }
      },
      privileges: {}
    },
    connection: { harwareInfo: [], roles: [] }
  }

  const renderWithProvider = (chartProps) => {
    return renderWithRedux(
      <ChartContainerHeader {...chartProps} />,
      null,
      state
    )
  }

  describe("<ChartContainerHeader />", () => {
    it("should show edit button for chart when on dashboard", () => {
      const { getByTestId, queryByTestId } = renderWithProvider({
        editId: "",
        id: "1"
      })
      expect(getByTestId("chart-settings-button")).toBeInTheDocument()
      expect(queryByTestId("chart-right-controls")).toBeInTheDocument()
    })

    it("should not show edit button when not in edit mode", () => {
      // editId is a >0 length string here, so its in edit mode
      const { queryByTestId } = renderWithProvider(props)
      expect(queryByTestId("chart-right-controls")).toBe(null)
    })
  })

  describe("mapStateToProps", () => {
    it("maps charts, id, editid state to props", () => {
      const ownProps = {
        id: "1",
        editId: ""
      }
      expect(mapStateToProps(state, ownProps)).toStrictEqual({
        chartAddon: undefined,
        dataSource: "flights",
        dataSourceAlias: "A",
        hasSnapshots: false,
        type: "line",
        layers: [],
        isFrontendChart: true,
        vegaChart: false,
        title: "foo",
        isEditMode: false,
        id: "1",
        shouldShowClearFilters: false,
        shouldShowExportButton: true,
        shouldShowSourceIcon: false,
        supportsServerSideExport: false,
        linkedZoomEnabled: false,
        roles: [],
        dcFlag: undefined,
        disableDistributedDataExport: false,
        allExportableLayersHidden: false
      })
      state.omnifilters.push({
        chartId: "1",
        enabled: true,
        appliesTo: "CROSSFILTER"
      })
      ownProps.editId = "1"
      expect(mapStateToProps(state, ownProps)).toStrictEqual({
        chartAddon: undefined,
        dataSource: "flights",
        dataSourceAlias: "A",
        hasSnapshots: false,
        type: "line",
        layers: [],
        isFrontendChart: true,
        vegaChart: false,
        title: "foo",
        isEditMode: true,
        id: "1",
        shouldShowClearFilters: true,
        shouldShowExportButton: true,
        shouldShowSourceIcon: false,
        supportsServerSideExport: false,
        linkedZoomEnabled: false,
        roles: [],
        dcFlag: undefined,
        disableDistributedDataExport: false,
        allExportableLayersHidden: false
      })

      state.dashboard.dataSources = {
        flights: {
          alias: "A"
        },
        taxi: {
          alias: "B"
        }
      }
      expect(mapStateToProps(state, ownProps)).toStrictEqual({
        chartAddon: undefined,
        dataSource: "flights",
        dataSourceAlias: "A",
        hasSnapshots: false,
        type: "line",
        layers: [],
        isFrontendChart: true,
        vegaChart: false,
        title: "foo",
        isEditMode: true,
        id: "1",
        shouldShowClearFilters: true,
        shouldShowExportButton: true,
        shouldShowSourceIcon: true,
        supportsServerSideExport: false,
        linkedZoomEnabled: false,
        roles: [],
        dcFlag: undefined,
        disableDistributedDataExport: false,
        allExportableLayersHidden: false
      })

      // Don't allow Text Chart to be exported
      state.dashboard.dataSources = {
        flights: {
          alias: "A"
        }
      }

      state.omnifilters.push({
        chartId: "2",
        enabled: true
      })
      ownProps.id = "2"
      ownProps.editId = 2
      expect(mapStateToProps(state, ownProps)).toStrictEqual({
        chartAddon: undefined,
        dataSource: null,
        dataSourceAlias: null,
        hasSnapshots: false,
        type: "text",
        layers: [],
        title: "",
        isFrontendChart: true,
        vegaChart: false,
        isEditMode: false,
        id: "2",
        shouldShowClearFilters: false,
        shouldShowExportButton: false,
        shouldShowSourceIcon: false,
        supportsServerSideExport: false,
        linkedZoomEnabled: false,
        roles: [],
        dcFlag: undefined,
        disableDistributedDataExport: false,
        allExportableLayersHidden: false
      })
    })
  })

  describe("mapDispatchToProps", () => {
    let dispatch = null
    let theActions = null
    beforeEach(() => {
      dispatch = jest.fn()
      const id = 1
      const { actions } = mapDispatchToProps(dispatch, { id })
      theActions = actions
    })

    describe("handleEditChart", () => {
      it("navigate to chart/:id/edit", () => {
        theActions.handleEditChart()
        expect(dispatch).toHaveBeenCalled()
      })
    })
    describe("handleDeleteChart", () => {
      it("should delete chart", () => {
        theActions.handleDeleteChart()
        expect(dispatch).toHaveBeenCalled()
      })
    })
    /*
    // updateChart now returns a thunk. This test must be updated.
    describe("clearFilters", () => {
      it("should clear filters on chart and set areFiltersInverse to false", () => {
        theActions.clearFilters()
        expect(dispatch).toHaveBeenCalledWith(
          updateChart(1, {
            filters: [],
            rangeFilter: [],
            areFiltersInverse: false
          })
        )
      })
    })
    */
  })
})
