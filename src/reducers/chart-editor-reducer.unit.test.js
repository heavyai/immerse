// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setChartEditorTablePreview } from "actions/chart-editor-action-creators"
import {
  SAVE_CURRENT_CHART,
  SELECT_MULTI_SOURCE_PANEL
} from "constants/action-types"

import ChartEditorReducer, { initialState } from "./chart-editor-reducer"

describe("Chart Editor Reducer", () => {
  it("should return the correct initial state", () => {
    expect(ChartEditorReducer(undefined, {})).toEqual(initialState)
  })

  it("should handle the SAVE_CURRENT_CHART action action type", () => {
    const id = "1"
    const chart = { type: "pie", measures: [] }
    const state = ChartEditorReducer(
      {},
      {
        type: SAVE_CURRENT_CHART,
        chartId: id,
        chart,
        filtersForChart: {}
      }
    )

    expect(state.savedCharts[1]).toEqual(chart)
  })

  it("should handle table preview set", () => {
    expect(
      ChartEditorReducer(
        {
          tablePreviewName: null
        },
        setChartEditorTablePreview("test")
      )
    ).toEqual({
      tablePreviewName: "test"
    })
  })

  describe("SELECT_MULTI_SOURCE_PANEL action", () => {
    it("should default to 0", () => {
      const state = ChartEditorReducer(undefined, { action: undefined })
      expect(state.selectedMultiSourcePanel).toEqual(0)
    })

    it("should set the selectedMultiSourcePanel value correctly", () => {
      const selectedMultiSourcePanel = 5
      const action = {
        type: SELECT_MULTI_SOURCE_PANEL,
        selectedMultiSourcePanel
      }
      const state = ChartEditorReducer(initialState, action)
      expect(state.selectedMultiSourcePanel).toEqual(selectedMultiSourcePanel)
    })
  })
})
