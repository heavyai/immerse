// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { buildCrossFilterMetadata } from "vega/constants/filter-metadata-types"
import {
  andFilter,
  orFilter,
  multiSourceFilter,
  simpleFilter
} from "vega/constants/filter-types"
import {
  fillLineGaps,
  selectedValuesFromCrossfilter,
  separateData,
  transformData
} from "./combo-chart"
import { buildKey } from "vega/charts/top-n-utils"

describe("selectedValuesFromCrossfilter", () => {
  // add a dashboard filter and a crossfilter
  const crossfilter = buildCrossFilterMetadata(
    "chart1-crossfilter",
    multiSourceFilter({
      flights: andFilter([
        // technically there should never be a positive and negative filter,
        // but for testing...
        orFilter([
          andFilter([
            simpleFilter("flights", "flights", "origin_state", "STR", "=", "PA")
          ])
        ]),
        andFilter([
          orFilter([
            simpleFilter(
              "flights",
              "flights",
              "origin_state",
              "STR",
              "<>",
              "CA"
            )
          ])
        ])
      ])
    }),
    true,
    "1"
  )

  it("should return all crossfilters", () => {
    const result = selectedValuesFromCrossfilter(crossfilter, {
      bins: undefined,
      scaled: undefined
    })
    expect(result).toHaveProperty("enabled", true)
    expect(result).toHaveProperty("selectedValues", [JSON.stringify(["PA"])])
    expect(result).toHaveProperty("negativeSelectedValues", [
      JSON.stringify(["CA"])
    ])
    expect(result).toHaveProperty("rangeValues", [])
  })
})

describe("transformData", () => {
  const dataSelection = {
    table: { name: "table" },
    dimensions: {
      xAxis: [
        { type: "column", column: { name: "col1" } },
        { type: "column", column: { name: "col2" } }
      ]
    },
    measures: {
      size: [{ type: "count" }]
    }
  }
  const data = [
    { dimension0: "Dim00", dimension1: "Dim01", measure0: 1 },
    { dimension0: "Dim10", dimension1: "Dim11", measure0: 2 },
    { dimension0: "Dim20", dimension1: "Dim21", measure0: 3 }
  ]
  const measureSettingsLookup = {
    measure0_0: { disabled: false },
    measure0_1: { disabled: false },
    [buildKey("color", "0")]: { disabled: false }
  }
  const dimensionFormatter = (v) => String(v)
  const dimensionScaler = (v) => v

  it("adds a dimension key", () => {
    const result = transformData(
      dataSelection,
      0,
      data,
      measureSettingsLookup,
      false,
      undefined,
      dimensionFormatter,
      dimensionScaler,
      []
    )

    result.forEach((row, i) => {
      expect(row).toHaveProperty(
        "dimension",
        JSON.stringify([`Dim${i}0`, `Dim${i}1`])
      )
    })
  })

  it("adds measureKey", () => {
    const dataSelectionIndex = 0
    const result = transformData(
      dataSelection,
      dataSelectionIndex,
      data,
      measureSettingsLookup,
      false,
      undefined,
      dimensionFormatter,
      dimensionScaler
    )

    result.forEach((row) => {
      expect(row).toHaveProperty("measureKey", `measure0_${dataSelectionIndex}`)
    })
  })

  it("appends dataSelectionIndex to measureKey", () => {
    const dataWithColor = data.map((row) => ({
      dimensionColor: "color",
      ...row
    }))
    const dataSelectionIndex = 0
    const result = transformData(
      dataSelection,
      dataSelectionIndex,
      dataWithColor,
      measureSettingsLookup,
      true,
      undefined,
      dimensionFormatter,
      dimensionScaler
    )

    result.forEach((row) => {
      expect(row).toHaveProperty(
        "measureKey",
        `string-color-${dataSelectionIndex}`
      )
    })
  })

  it("adds dataSelectionIndex", () => {
    const dataSelectionIndex = 1
    const result = transformData(
      dataSelection,
      dataSelectionIndex,
      data,
      measureSettingsLookup,
      false,
      undefined,
      dimensionFormatter,
      dimensionScaler
    )

    result.forEach((row) => {
      expect(row).toHaveProperty("dataSelectionIndex", dataSelectionIndex)
    })
  })
})

describe("connectNullsAcrossGaps", () => {
  const measureSettingsLookup = {
    m1: {
      axis: "primary",
      visualizeAs: "line",
      order: 0,
      dataSelectionIndex: 0,
      measureIndex: 0
    }
  } as any

  const sortedDimensions = ["[1]", "[2]", "[3]"]
  const dimensionsFormatted = { "[1]": "1", "[2]": "2", "[3]": "3" }

  describe("separateData", () => {
    it("marks null line measures as gaps when connectNullsAcrossGaps is false", () => {
      const data = [
        { measureKey: "m1", dimension: "[1]", measure: 10 },
        { measureKey: "m1", dimension: "[2]", measure: null },
        { measureKey: "m1", dimension: "[3]", measure: 30 }
      ]

      const result = separateData(data, measureSettingsLookup, false)

      expect(result.primary?.line).toHaveLength(3)
      expect(result.primary?.line?.[1]).toMatchObject({
        dimension: "[2]",
        gap: true
      })
    })

    it("drops null line measures entirely when connectNullsAcrossGaps is true", () => {
      const data = [
        { measureKey: "m1", dimension: "[1]", measure: 10 },
        { measureKey: "m1", dimension: "[2]", measure: null },
        { measureKey: "m1", dimension: "[3]", measure: 30 }
      ]

      const result = separateData(data, measureSettingsLookup, true)

      expect(result.primary?.line).toHaveLength(2)
      expect(result.primary?.line?.map((d: any) => d.dimension)).toEqual([
        "[1]",
        "[3]"
      ])
    })
  })

  describe("fillLineGaps", () => {
    it("fills missing dimensions with gap rows when connectNullsAcrossGaps is false", () => {
      const separated = {
        primary: {
          line: [
            {
              measureKey: "m1",
              dimension: "[1]",
              dimensions: [1],
              measure: 10,
              measureMin: 10,
              measureMax: 10
            },
            {
              measureKey: "m1",
              dimension: "[3]",
              dimensions: [3],
              measure: 30,
              measureMin: 30,
              measureMax: 30
            }
          ]
        }
      } as any

      const result = fillLineGaps(
        separated,
        sortedDimensions,
        dimensionsFormatted,
        measureSettingsLookup,
        false
      )

      const filledForMissing = result.primary?.line?.find(
        (d: any) => d.dimension === "[2]"
      )
      expect(filledForMissing).toMatchObject({ gap: true, dimension: "[2]" })
    })

    it("does not fill missing dimensions when connectNullsAcrossGaps is true", () => {
      const separated = {
        primary: {
          line: [
            {
              measureKey: "m1",
              dimension: "[1]",
              dimensions: [1],
              measure: 10,
              measureMin: 10,
              measureMax: 10
            },
            {
              measureKey: "m1",
              dimension: "[3]",
              dimensions: [3],
              measure: 30,
              measureMin: 30,
              measureMax: 30
            }
          ]
        }
      } as any

      const result = fillLineGaps(
        separated,
        sortedDimensions,
        dimensionsFormatted,
        measureSettingsLookup,
        true
      )

      expect(result.primary?.line).toHaveLength(2)
      expect(
        result.primary?.line?.find((d: any) => d.dimension === "[2]")
      ).toBeUndefined()
    })
  })
})
