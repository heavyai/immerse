// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createCountChartAsync } from "./count-chart"
import dc from "services/dc"

const defaultValues = {}

const crossfilter = {
  getId: () => "1",
  getTables: () => ["flights"],
  getDataSource: () => "flights",
  groupAll: () => {
    return {
      getCrossfilterId: jest.fn(() => 0)
    }
  },
  addCountChartGroupAll: jest.fn(() => true)
}

describe("Count Chart", () => {
  describe("createRowChart", () => {
    it("should create and return a count chart", () => {
      const node = window.document.createElement("DIV")
      const create = createCountChartAsync(crossfilter)
      return create(defaultValues, node).then((c) => {
        expect(dc.instanceOfChart(c)).toEqual(true)
      })
    })
    it("should reject the creation promise if there is an error", () => {
      const node = window.document.createElement("DIV")
      const create = createCountChartAsync({})
      return create(defaultValues, node).catch((error) => {
        expect(Boolean(error)).toEqual(true)
      })
    })
  })
})
