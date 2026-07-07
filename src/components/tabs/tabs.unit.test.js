// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { renderWithRedux } from "jest/renderScaffolding"
import { BrowserRouter as Router } from "react-router-dom"
import "@testing-library/jest-dom/extend-expect"
import { DragDropContext } from "react-dnd"
import HTML5Backend from "react-dnd-html5-backend"
import Tabs from "./Tabs"

const TabsWithDragDropContext = DragDropContext(HTML5Backend)(Tabs)

describe("<Tabs /> component", () => {
  it("should render a component", () => {
    const initialState = {
      dashboard: {
        id: 46,
        tabs: {
          abcde: { tabId: "abcde", index: 0 },
          fghij: { tabId: "fghij", index: 1 }
        },
        selectedTabId: "fghij",
        privileges: {}
      }
    }

    const { container } = renderWithRedux(
      <Router>
        <TabsWithDragDropContext />
      </Router>,
      null,
      initialState
    )

    expect(container.firstChild).not.toBeEmpty()
  })
})
