// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import configureStore from "redux-mock-store"
import thunk from "redux-thunk"
import { fireEvent } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { renderWithRedux } from "jest/renderScaffolding"
import mockAppState from "utils/test-helpers/mock-app-state"
import {
  paramState,
  chartIdWithParamTitle,
  selectedParameterSetValue
} from "components/parameters/parameter-mock-store"
import { populateImportableStore as setStore } from "store/importableStore"
import { UPDATE_CHART } from "constants/action-types"
import { ENTER_KEY_NUM } from "constants/magic-variables"
import ChartTitle from "./chart-title-parent"

const middlewares = [thunk]
const mockStore = configureStore(middlewares)({
  ...mockAppState,
  ...paramState
})
const dispatch = jest.fn()
const defaultProps = {
  dispatch,
  isEditMode: false,
  id: "4",
  title: "Chart Title",
  chartType: "vega-combo",
  dashboardPrivileges: {}
}

function resetStore() {
  setStore(null)
}

describe("Chart Title", () => {
  describe("Component", () => {
    beforeEach(() => {
      setStore(mockStore)
    })

    afterEach(() => {
      resetStore()
    })

    it("should show render no-edit-mode div when not in edit mode", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} />,
        mockStore
      )
      expect(getByTestId("chart-title-no-edit")).toBeTruthy()
    })

    it("should show a processed title when in edit mode and chart title is not focused", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} isEditMode />,
        mockStore
      )
      expect(getByTestId("chart-title-processed")).toBeTruthy()
    })

    it("should render input when in edit mode and chart title is focused", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} isEditMode />,
        mockStore
      )
      const chartTitle = getByTestId("chart-title")
      chartTitle.click()
      expect(getByTestId("chart-title-textarea")).toBeTruthy()
    })

    it("should not update chart title unless user has changed input value of textarea and clicks off", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} isEditMode />,
        mockStore
      )
      const chartTitle = getByTestId("chart-title")
      chartTitle.click()
      const input = getByTestId("chart-title-textarea")
      input.click()
      input.blur()

      expect(mockStore.getActions().length).toBe(0)
    })

    it("should update chart title when user clicks on textarea, changes value, and clicks off", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} isEditMode />,
        mockStore
      )
      const chartTitle = getByTestId("chart-title")
      chartTitle.click()
      const updatedTitle = "foo"
      const input = getByTestId("chart-title-textarea")
      input.click()
      input.focus()
      fireEvent.change(input, { target: { value: updatedTitle } })
      input.blur()

      expect(mockStore.getActions()[0].type).toEqual(UPDATE_CHART)
      expect(input.value).toEqual(updatedTitle)
      expect(getByTestId("chart-title-processed")).toBeTruthy()
    })

    it("should update chart title when user clicks on textarea, changes value, and presses enter", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} isEditMode />,
        mockStore
      )
      const chartTitle = getByTestId("chart-title")
      chartTitle.click()
      const updatedTitle = "foo"
      const input = getByTestId("chart-title-textarea")
      input.click()
      input.focus()
      fireEvent.change(input, { target: { value: updatedTitle } })
      fireEvent.keyDown(input, { which: ENTER_KEY_NUM })

      expect(mockStore.getActions()[0].type).toEqual(UPDATE_CHART)
      expect(input.value).toEqual(updatedTitle)

      input.blur()
      expect(getByTestId("chart-title-processed")).toBeTruthy()
    })

    it("should show title with parameter values", () => {
      const { getByTestId } = renderWithRedux(
        <ChartTitle {...defaultProps} id={chartIdWithParamTitle} isEditMode />,
        mockStore
      )

      expect(getByTestId("chart-title-processed-text").innerHTML).toEqual(
        selectedParameterSetValue
      )
    })
  })
})
