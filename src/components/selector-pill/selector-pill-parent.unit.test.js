// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mapStateToProps, mergeProps } from "./selector-pill-parent"
import "charts/chart-definitions"

describe("SelectorPill Parent", () => {
  describe("mapStateToProps", () => {
    describe("shouldShowAggType", () => {
      it("should be false when there are no active dimensions", () => {
        const state = {
          charts: {
            1: {
              type: "pie",
              dimensions: [{ value: 5, inactive: true }]
            }
          }
        }
        const props = {
          chartId: "1",
          aggType: "AVG",
          label: "",
          selector: {
            custom: false
          }
        }
        const mappedProps = mapStateToProps(state, props)
        expect(mappedProps.numDimensions).toEqual(0)
        expect(mappedProps.shouldShowAggType).toEqual(false)
      })
    })
    it("should be false when the chartType is pointmap", () => {
      const state = {
        charts: {
          1: {
            type: "pointmap",
            dimensions: [{ value: 5, inactive: false }]
          }
        }
      }
      const props = {
        chartId: "1",
        aggType: "AVG",
        label: "",
        selector: {
          custom: false
        }
      }
      expect(mapStateToProps(state, props).shouldShowAggType).toEqual(false)
    })
  })
  describe("merged Props", () => {
    describe("handleSelectorClick", () => {
      const props = {
        chart: { type: "pie" },
        index: 0,
        selectorType: "measures",
        inactive: true,
        openSelectorPopover: jest.fn(),
        selector: { timeBin: "" }
      }
      beforeEach(() => {
        props.openSelectorPopover = jest.fn()
      })
      it("should do nothing when selector is inactive", () => {
        mergeProps(props).handleSelectorClick()
        expect(props.openSelectorPopover).not.toHaveBeenCalled()
      })
      it("should invoke openSelectorPopover when selector is active", () => {
        mergeProps(
          Object.assign({}, props, { inactive: false })
        ).handleSelectorClick()
        expect(props.openSelectorPopover).toHaveBeenCalled()
      })
    })
  })
})
