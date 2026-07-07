// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import { updateDimensionNames } from "./dimension-object-helpers"

describe("Dimension Object Helpers", () => {
  describe("updateDimensionNames Function", () => {
    it("should rename dimension if new chart type has a name", () => {
      const dimension = { name: null }
      const renamer = updateDimensionNames("line")
      expect(renamer(dimension, 0).name).to.eql("X Axis")
    })

    it("should set name to null if new chart type has no name", () => {
      const dimension = { name: "X Axis" }
      const renamer = updateDimensionNames("pie")
      expect(renamer(dimension, 0).name).to.eql(null)
    })
  })
})
