// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapDispatchToProps } from "./dimension-bin-settings-parent"

import mockAppState from "utils/test-helpers/mock-app-state"

const getState = (measures) => (_) => ({
  ...mockAppState,
  charts: { 1: { measures: measures || [], dimensions: [] } }
})

describe("DimensionBinSettings Parent Component", () => {
  const services = new Map()
  let setter = () => {}
  let dispatch = null
  let dispatchWrapper = null
  let dispatchProps = null

  const props = {
    chartId: "1",
    index: 1,
    dimension: {
      isBinned: true
    }
  }

  const dc = {
    getChart: jest.fn()
  }

  services.set("dc", dc)

  beforeEach(() => {
    setter = () => {}
    dispatch = jest.fn((a) => {
      if (typeof a === "function") {
        dispatchWrapper(a)
      } else {
        setter = a.setter
      }
    })
    dispatchWrapper = (thunk) => thunk(dispatch, getState(), services)
    dispatchProps = mapDispatchToProps(dispatchWrapper, props)
  })

  describe("Dimension Bin Settings Parent method props", () => {
    it("should return an updateIsBinned method", () => {
      dispatchProps.updateIsBinned()
      expect(setter({ isBinned: true })).toEqual({
        isBinned: !props.dimension
      })
    })

    it("should return an updateBinRangeSlider method", () => {
      dispatchProps.updateBinRangeSlider([0, 1])
      expect(dispatch).toHaveBeenCalled()
      // expect(setter({})).toEqual({
      //   currentLowValue: 0,
      //   currentHighValue: 1,
      //   extentsSet: true,
      //   minMax: [0, 1]
      // })
    })
  })
})
