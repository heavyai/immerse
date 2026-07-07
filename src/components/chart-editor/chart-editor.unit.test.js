// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { DragDropContext } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import { render, screen } from "@testing-library/react"

import withStoreContext from "utils/test-helpers/with-store-context"
import mockAppState from "utils/test-helpers/mock-app-state"
import { ChartEditor } from "./chart-editor"
import { BrowserRouter as Router } from "react-router-dom"
import "charts/chart-definitions"

const Editor = DragDropContext(HTML5Backend)(ChartEditor)
const CHART_ID = "7"

const defaultProps = {
  id: CHART_ID,
  chart: mockAppState.charts[CHART_ID],
  selectorPillHover: mockAppState.ui.selectorPillHover,
  autoSize: true,
  measures: [],
  dimensions: [],
  dispatch: () => {},
  isMultiSourceEnabled: false,
  isMultiLayeringEnabled: false,
  isPolyRasterEnabled: false,
  shouldShowAddNewDataSourceButton: false,
  shouldShowDataSourcePrompt: false,
  shouldShowErrorDisplay: false
}

function createWrapper(props = defaultProps) {
  return render(
    withStoreContext(
      <Router>
        <Editor {...props} />, mockAppState)
      </Router>
    )
  )
}

describe("Chart Editor", () => {
  beforeEach(() => {
    createWrapper()
  })
  describe("Left Panel", () => {
    describe("Measures Container", () => {
      it("should render", () => {
        expect(screen.getByTestId("measures-container")).toBeInTheDocument()
      })
    })
  })
})
