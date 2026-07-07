// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"
import withStoreContext from "utils/test-helpers/with-store-context"
import { initChartEditorTablePreview } from "actions/chart-editor-action-creators"
import DataSourceSelector from "./data-source-selector"
import { setFeatureFlag } from "components/control-panel/featureflags"

describe("DataSourceSelector Component", () => {
  const mockState = {
    connection: {
      isMSDEnabled: true,
      roles: []
    },
    dashboard: { dataSources: { flights: {} } },
    tables: { list: [{ name: "flights" }] },
    chartEditor: { savedDataSources: {} }
  }

  describe("preview", () => {
    it("should show and dismiss table preview", () => {
      setFeatureFlag("ui/enable_joins", false)
      const dispatch = jest.fn()
      const { container } = render(
        withStoreContext(<DataSourceSelector />, mockState, dispatch)
      )

      const addSourceButton = container.querySelector(".add-source")
      fireEvent.click(addSourceButton)

      const dropdownList = container.querySelector(
        ".autocomplete-dropdown-list"
      )
      fireEvent.mouseMove(dropdownList)

      const flights = container.querySelector(".autocomplete-dropdown-item")
      fireEvent.mouseEnter(flights)

      expect(dispatch).toHaveBeenCalledWith(
        initChartEditorTablePreview("flights")
      )

      fireEvent.click(flights)

      expect(dispatch).toHaveBeenCalledWith(initChartEditorTablePreview(null))
    })
  })
})
