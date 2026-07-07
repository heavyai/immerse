// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai"
import addDimensionReducer from "./add-dimension-reducer"

describe("addDimension Reducer", () => {
  const initialState = {
    ["1"]: {
      type: "pie",
      dimensions: [{}],
      measures: [],
      savedColors: {}
    }
  }

  it("should add or update a dimension at the selected index", () => {
    const nextState = addDimensionReducer(initialState, {
      chartId: "1",
      index: 0,
      dimension: {
        type: "STR",
        value: "dest",
        label: "dest",
        max_val: null,
        min_val: null,
        maxBinSize: null,
        currentHighValue: null,
        currentLowValue: null,
        autobin: false,
        numOfBins: null,
        isBinned: false,
        isBinnable: false
      }
    })

    expect(nextState["1"].dimensions).to.deep.equal([
      {
        type: "STR",
        value: "dest",
        label: "dest",
        inactive: false,
        maxBinSize: null,
        max_val: null,
        min_val: null,
        currentHighValue: null,
        currentLowValue: null,
        autobin: false,
        isBinnable: false,
        isBinned: false,
        numOfBins: null
      },
      {}
    ])
  })

  it("should handle the creation of binned dimensions", () => {
    const nextState = addDimensionReducer(initialState, {
      chartId: "1",
      index: 0,
      dimension: {
        is_dict: false,
        label: "airtime",
        type: "SMALLINT",
        value: "airtime"
      }
    })
    expect(nextState["1"].dimensions).to.deep.equal([
      {
        is_dict: false,
        label: "airtime",
        type: "SMALLINT",
        value: "airtime",
        extract: false,
        inactive: false,
        loading: true,
        timeBin: null
      },
      {}
    ])
  })

  it('should set timeBin to "auto" when setting up binned time dimensions', () => {
    const nextState = addDimensionReducer(initialState, {
      chartId: "1",
      index: 0,
      dimension: {
        is_dict: false,
        label: "sales time",
        type: "TIME",
        value: "timeofsale"
      }
    })
    expect(nextState["1"].dimensions).to.deep.equal([
      {
        is_dict: false,
        label: "sales time",
        type: "TIME",
        value: "timeofsale",
        extract: undefined,
        inactive: false,
        loading: true,
        timeBin: "auto"
      },
      {}
    ])
  })
})
