// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render } from "@testing-library/react"
import { connectElement, drop as dropSelector } from "./make-drop-and-draggable"

it("attaches both drag and drop connectors and the original ref to the selector node, then detaches all three", () => {
  const drag = jest.fn()
  const drop = jest.fn()
  const original = jest.fn()
  const Selector = () =>
    connectElement(drag)(
      connectElement(drop)(<div ref={original} data-testid="pill" />)
    )
  const { getByTestId, unmount } = render(
    <Selector selectorType="dimensions" index={0} />
  )
  const node = getByTestId("pill")
  for (const connector of [drag, drop, original]) {
    expect(connector).toHaveBeenCalledWith(node)
  }
  unmount()
  for (const connector of [drag, drop, original]) {
    expect(connector).toHaveBeenLastCalledWith(null)
  }
})

describe("SelectorPill Parent", () => {
  describe("when component is dragged and dropped", () => {
    const props = {
      chart: {
        measures: [
          { name: "first", label: "carrierdelay" },
          { name: "second", label: "arrivaltime" }
        ]
      },
      type: "INT",
      index: 0,
      swapSelectors: jest.fn(),
      selectorType: "measures"
    }

    const monitor = {
      getItem: () => ({ index: 1 })
    }

    dropSelector(props, monitor)

    it("should call the swapSelectors prop", () => {
      expect(props.swapSelectors).toHaveBeenCalled()
    })
  })
})
