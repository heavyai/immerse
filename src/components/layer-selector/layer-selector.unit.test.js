// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import withStoreContext from "utils/test-helpers/with-store-context"
import mockAppState from "utils/test-helpers/mock-app-state"

import LayerSelector, { LayerPill } from "./layer-selector"

function renderWithStore(Component, props) {
  return render(
    withStoreContext(<Component {...props} />, {
      ...mockAppState,
      charts: {
        "1": {
          layers: []
        }
      }
    })
  )
}

jest.mock("store/importableStore", () => ({
  importableStore: {
    getState: () => mockAppState
  }
}))

describe("LayerSelectors", () => {
  describe("LayerPill Component", () => {
    const props = {
      layerIdDisplay: "layr",
      toggleLayer: () => {},
      connectDragSource: jest.fn((x) => x),
      connectDropTarget: jest.fn((x) => x),
      isDragging: false,
      isOver: false,
      spec: {
        dataSource: "foo",
        type: "geoheat"
      }
    }

    it("mounts and calls connectDragSource and connectDropTarget", () => {
      renderWithStore(LayerPill, props)
      expect(props.connectDragSource).toHaveBeenCalled()
      expect(props.connectDropTarget).toHaveBeenCalled()
    })
  })

  describe("LayerSelector integration", () => {
    it("mounts", () => {
      const { container } = renderWithStore(LayerSelector, {
        id: "1"
      })
      expect(container.querySelectorAll(".layer-selectors")).toHaveLength(1)
    })
  })
})
