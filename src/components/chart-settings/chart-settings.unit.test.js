// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { assign } from "lodash"
import React from "react"
import mockAppState from "utils/test-helpers/mock-app-state"
import { renderWithRedux } from "utils/test-helpers/render-with-redux"

import { PointmapDisplaySettings } from "charts/raster-chart/point/pointmap-display-settings"
import PieChartSettings from "charts/pie/chart-settings"
import RowChartSettings from "charts/row/chart-settings"
import "charts/chart-definitions"

const chart = {
  type: undefined,
  dimensions: [{}],
  measures: [{}],
  areFiltersInverse: false,
  autoSize: false,
  showNullDimensions: false,
  cap: 0,
  elasticX: false,
  filters: {},
  sortColumn: {}
}
const baseProps = {
  id: "4",
  chart,
  onValueChangeWithCap: () => {},
  onValueChangeWithChartStyle: () => {},
  onValueChangeWithLayerOpacity: () => {},
  onValueChangeWithPieStyle: () => {},
  onValueChangeWithRangeChart: () => {},
  onValueChangeWithRangeChart2: () => {},
  onValueChangeWithSizeDomain: () => {},
  onValueChangeWithSizeRange: () => {},
  updateChart: () => {},
  elasticX: false
}

/** @param {string} type */
const makeChart = (type) => assign({}, chart, { type })
/** @param {any} chartProp */
const makeProps = (chartProp) => assign({}, baseProps, { chart: chartProp })

describe("ChartSettings Component", () => {
  it("renders one CustomSlider component on pie chart", () => {
    const pie = makeChart("pie")
    const props = makeProps(pie)

    /** @type {any} */
    const pieRender = renderWithRedux(
      <PieChartSettings {...props} />,
      mockAppState
    )
    const { container } = pieRender

    const sliders = container.querySelectorAll(".custom-slider")
    expect(sliders).toHaveLength(1)
  })

  it("renders one CustomSlider component on row chart", () => {
    const row = makeChart("row")
    const props = makeProps(row)

    /** @type {any} */
    const rowRender = renderWithRedux(<RowChartSettings {...props} />)
    const { container } = rowRender

    const sliders = container.querySelectorAll(".custom-slider")
    expect(sliders).toHaveLength(1)
  })
})

describe("PointmapChartSettings", () => {
  /** @type {any} */
  let props = null

  beforeEach(() => {
    const pointmap = makeChart("pointmap")
    props = makeProps(pointmap)
    props.chart.measures[2] = { value: "followers", minMax: [2, 19] }
  })

  it("renders three CustomSlider components on pointmap chart without size measure", () => {
    delete props.chart.measures[2]

    /** @type {any} */
    const renderResult = renderWithRedux(
      <PointmapDisplaySettings
        {...props}
        measuresWithNumberFormat={[]}
        onValueChangeWithFormat={() => {}}
      />
    )
    const { container } = renderResult

    const sliders = container.querySelectorAll(".custom-slider")
    expect(sliders).toHaveLength(3)
  })

  it("renders three CustomSlider components on pointmap chart when isError is active on size measure", () => {
    props.chart.measures[2].isError = true

    /** @type {any} */
    const renderResult = renderWithRedux(
      <PointmapDisplaySettings
        {...props}
        measuresWithNumberFormat={[]}
        onValueChangeWithFormat={() => {}}
      />
    )
    const { container } = renderResult

    const sliders = container.querySelectorAll(".custom-slider")
    expect(sliders).toHaveLength(3)
  })

  it("renders four CustomSlider components on pointmap chart with size measure", () => {
    /** @type {any} */
    const renderResult = renderWithRedux(
      <PointmapDisplaySettings
        {...props}
        measuresWithNumberFormat={[]}
        onValueChangeWithFormat={() => {}}
      />
    )
    const { container } = renderResult

    const sliders = container.querySelectorAll(".custom-slider")
    expect(sliders).toHaveLength(4)
  })

  it("uses minMax as both initial values and min and max of domain slider", () => {
    /** @type {any} */
    const renderResult = renderWithRedux(
      <PointmapDisplaySettings
        {...props}
        measuresWithNumberFormat={[]}
        onValueChangeWithFormat={() => {}}
      />
    )
    const { container } = renderResult

    const minInput = container.querySelector("#size-domain-min")
    const maxInput = container.querySelector(
      '[data-testid="size-domain-input"]'
    )

    expect(minInput).not.toBeNull()
    expect(maxInput).not.toBeNull()
    expect(minInput).toHaveValue("2")
    expect(maxInput).toHaveValue("19")
  })

  it("allows user to set values for domain slider", () => {
    const onValueChangeWithSizeDomain = jest.fn()

    /** @type {any} */
    const renderResult = renderWithRedux(
      <PointmapDisplaySettings
        {...props}
        measuresWithNumberFormat={[]}
        onValueChangeWithFormat={() => {}}
        onValueChangeWithSizeDomain={onValueChangeWithSizeDomain}
      />
    )
    const { container } = renderResult

    const sizeDomainSlider = container.querySelector(
      '.size-domain [data-testid="size-domain"]'
    )
    expect(sizeDomainSlider).toBeInTheDocument()
  })
})
