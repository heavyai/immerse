// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { drop } from "./make-drop-and-draggable"

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

    drop(props, monitor)

    it("should call the swapSelectors prop", () => {
      expect(props.swapSelectors).toHaveBeenCalled()
    })
  })
})
