// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import BaseSourceSelector from "./BaseSourceSelector"

import { screen } from "@testing-library/react"
import {
  setFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import { renderWithRedux } from "../../../../test-config/jest/renderScaffolding"

describe("BaseSourceSelector", () => {
  const fetchSources = jest.fn().mockResolvedValue([])
  const onChange = jest.fn()
  const onClear = jest.fn()

  const defaultProps = {
    chartId: "0",
    layerId: "0",
    sortedTableOptions: [],
    selectedTable: null,
    onChange,
    onClear,
    actions: {
      initChartEditorTablePreview: jest.fn(),
      getTablesMeta: jest.fn(),
      getDataSourcesList: jest.fn(),
      openCustomSourceManager: jest.fn()
    },
    fetchSources
  }

  it("should render data source selector", () => {
    renderWithRedux(<BaseSourceSelector {...defaultProps} />)
    expect(screen.getByTestId("base-data-source-selector")).toBeInTheDocument()
  })

  describe("Joins enabled", () => {
    beforeAll(() => {
      setFeatureFlag(available_feature_flags.ENABLE_JOINS, true)
    })

    afterAll(() => {
      setFeatureFlag(available_feature_flags.ENABLE_JOINS, false)
    })

    it("should render data source selector with null table options", async () => {
      const nullProps = {
        ...defaultProps,
        sortedTableOptions: null
      }

      renderWithRedux(<BaseSourceSelector {...nullProps} />)
      expect(
        screen.getByTestId("base-data-source-selector")
      ).toBeInTheDocument()

      // Null implies that the sources are loading
      expect(screen.getByText("Loading sources")).toBeInTheDocument()
    })
  })
})
