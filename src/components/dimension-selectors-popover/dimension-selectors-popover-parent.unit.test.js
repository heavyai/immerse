// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import { mapStateToProps } from "components/dimension-selectors-popover/dimension-selectors-popover-parent"
import { populateImportableStore as setStore } from "store/importableStore"
import "charts/chart-definitions"
import mockAppState from "utils/test-helpers/mock-app-state"
import { paramState } from "components/parameters/parameter-mock-store"

const middlewares = [thunk]

const mockStore = configureStore(middlewares)({
  ...mockAppState,
  ...paramState
})
function resetStore() {
  setStore(null)
}

describe("DimensionSelectorsPopover Parent", () => {
  describe("showBinSettings", () => {
    beforeEach(() => {
      setStore(mockStore)
    })

    afterEach(() => {
      resetStore()
    })
    it("indicates bin settings should be shown", () => {
      const state = {
        charts: { 0: { type: "row", dimensions: [{}] } },
        dashboard: { columnMetadata: [] }
      }
      const props = {
        isDropdownOpen: false,
        selector: { isBinnable: true, type: "STR" },
        chartId: 0,
        index: 0
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.showBinSettings).toEqual(true)
      resetStore()
    })

    it("indicates bin settings should not be shown when dropdown open", () => {
      const state = {
        charts: { 0: { type: "row", dimensions: [{}] } },
        dashboard: { columnMetadata: [] }
      }
      const props = {
        isDropdownOpen: true,
        selector: { isBinnable: true, type: "STR" },
        chartId: 0,
        index: 0
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.showBinSettings).toEqual(false)
    })

    it("indicates bin settings should not be shown when not binnable", () => {
      const state = {
        charts: { 0: { type: "row", dimensions: [{}] } },
        dashboard: { columnMetadata: [] }
      }
      const props = {
        isDropdownOpen: false,
        selector: { isBinnable: false, type: "STR" },
        chartId: 0,
        index: 0
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.showBinSettings).toEqual(false)
    })

    it("indicates bin settings should be shown when selector type is time", () => {
      const state = {
        charts: { 0: { type: "row", dimensions: [{}] } },
        dashboard: { columnMetadata: [] }
      }
      const props = {
        isDropdownOpen: false,
        selector: { isBinnable: true, type: "DATE" },
        chartId: 0,
        index: 0
      }
      const newProps = mapStateToProps(state, props)
      expect(newProps.showTimeBinSettings).toEqual(true)
    })
  })
})
