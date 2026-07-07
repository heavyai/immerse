// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import CrossSectionDisplaySettings from "./cross-section-display-settings"
import { CHART_TYPES } from "constants/chart-types"
import { renderWithRedux } from "jest/renderScaffolding"
import { fireEvent } from "@testing-library/react"
import { UPDATE_RASTER_CHART } from "../raster-chart-actions"
import * as reactRedux from "react-redux"

describe("<CrossSectionDisplaySettings />", () => {
  let defaultState

  beforeEach(() => {
    defaultState = {
      chartEditor: {
        editId: "0"
      },
      charts: {
        "0": {
          type: CHART_TYPES.CROSS_SECTION,
          rasterLayerId: "huh",
          savedColors: {},
          smoothing: 10,
          searchDistance: 50,
          measures: [],
          dimensions: [],
          color: {
            type: "quantitative",
            key: "mapDScale",
            val: [
              "#115f9a",
              "#1984c5",
              "#22a7f0",
              "#48b5c4",
              "#76c68f",
              "#a6d75b",
              "#c9e52f",
              "#d0ee11",
              "#d0f400"
            ],
            customDomain: [],
            isCustom: false
          }
        }
      }
    }
  })
  const renderComponent = ({ store, initialState } = {}) => {
    return renderWithRedux(
      <CrossSectionDisplaySettings />,
      store,
      initialState || defaultState
    )
  }

  describe("Rendering", () => {
    test("should render all of the display settings for cross section type", () => {
      const { getByTestId } = renderComponent()
      expect(getByTestId("cross-section-display-settings")).toBeInTheDocument()
      expect(getByTestId("cross-section-smoothing")).toBeInTheDocument()
      expect(getByTestId("cross-section-search-distance")).toBeInTheDocument()
    })

    test("should only render smoothing for terrain type", () => {
      defaultState.charts["0"].type = CHART_TYPES.CROSS_SECTION_TERRAIN
      const { getByTestId, queryByTestId } = renderComponent(defaultState)
      expect(getByTestId("cross-section-display-settings")).toBeInTheDocument()
      expect(getByTestId("cross-section-smoothing")).toBeInTheDocument()
      expect(
        queryByTestId("cross-section-search-distance")
      ).not.toBeInTheDocument()
    })
  })

  describe("Modify settings", () => {
    test("should default smoothing and search distance if they are not set", () => {
      const { getByTestId } = renderComponent()
      expect(getByTestId("cross-section-smoothing-input")).toHaveValue("10")
    })
    test("should update chart when search distance is changed", () => {
      const { getByTestId } = renderComponent()
      expect(getByTestId("cross-section-search-distance-input")).toHaveValue(
        "50"
      )
    })
    test("should update chart when smoothing is changed", async () => {
      const dispatchSpy = jest.fn()
      jest
        .spyOn(reactRedux, "useDispatch")
        .mockImplementation(() => dispatchSpy)
      const { getByTestId } = renderComponent()
      const smoothingInput = getByTestId("cross-section-smoothing-input")
      expect(smoothingInput).toHaveValue("10")
      fireEvent.change(smoothingInput, { target: { value: "20" } })
      fireEvent.blur(smoothingInput)
      expect(dispatchSpy).toHaveBeenCalled()
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UPDATE_RASTER_CHART
        })
      )
    })
  })
})
