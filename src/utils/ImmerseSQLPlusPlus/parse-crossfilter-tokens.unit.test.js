// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import parseCrossFilterTokens from "./parse-crossfilter-tokens"
import * as crossfilterExtractorModule from "./crossfilter-extractor"
import * as featureFlagsModule from "components/control-panel/featureflags"

describe("parseCrossFilterTokens", () => {
  const opts = { chartId: "1", layerId: "layerid", layerName: "layername" }
  const expectedValues = {
    tableName: "tableName",
    cfChartId: "1",
    fallback: "fallback",
    copyToTable: "copyToTable",
    copyFields: { field1: "field2" }
  }
  const expectedCustomValues = {
    tableName: "${tableName}",
    cfChartId: "1",
    fallback: "fallback",
    copyToTable: "${copyToTable}",
    copyFields: { field1: "field2" }
  }

  let crossfilterExtractorSpy

  beforeEach(() => {
    crossfilterExtractorSpy = jest.fn()
    jest
      .spyOn(crossfilterExtractorModule, "crossfilterExtractor")
      .mockImplementation(crossfilterExtractorSpy)
    jest
      .spyOn(crossfilterExtractorModule, "default")
      .mockImplementation(crossfilterExtractorSpy)
    jest
      .spyOn(featureFlagsModule, "getFeatureFlag")
      .mockImplementation((flag) => {
        return (
          flag ===
          featureFlagsModule.available_feature_flags.PARSE_CROSSFILTER_TOKENS
        )
      })
  })

  afterEach(() => {
    crossfilterExtractorSpy.mockReset()
  })

  test.each([
    ["crossfilter.tableName", []],
    ["crossfilter.tableName[1]", ["cfChartId"]],
    ["crossfilter.tableName ?? fallback", ["fallback"]],
    ["crossfilter.tableName[1] ?? fallback", ["cfChartId", "fallback"]],
    ["FILTER_COPY(crossfilter.tableName, copyToTable)", ["copyToTable"]],
    [
      "FILTER_COPY(crossfilter.tableName, copyToTable, field1=field2)",
      ["copyToTable", "copyFields"]
    ],
    [
      "FILTER_COPY(crossfilter.tableName, copyToTable) ?? fallback",
      ["copyToTable", "fallback"]
    ],
    [
      "FILTER_COPY(crossfilter.tableName, copyToTable, field1 = field2) ?? fallback",
      ["copyToTable", "copyFields", "fallback"]
    ]
  ])("%s", (pattern, has) => {
    const expected = { tableName: expectedValues.tableName }
    for (const key of has) {
      expected[key] = expectedValues[key]
    }

    parseCrossFilterTokens(`\${${pattern}}`, opts)

    expect(crossfilterExtractorSpy).toHaveBeenCalledTimes(1)
    expect(crossfilterExtractorSpy).toHaveBeenCalledWith(
      expect.objectContaining(expected)
    )
  })

  test.each([
    ["crossfilter.${tableName}", []],
    ["crossfilter.${tableName}[1]", ["cfChartId"]],
    ["crossfilter.${tableName} ?? fallback", ["fallback"]],
    ["crossfilter.${tableName}[1] ?? fallback", ["cfChartId", "fallback"]],
    ["FILTER_COPY(crossfilter.${tableName}, ${copyToTable})", ["copyToTable"]],
    [
      "FILTER_COPY(crossfilter.${tableName}, ${copyToTable}, field1=field2)",
      ["copyToTable", "copyFields"]
    ],
    [
      "FILTER_COPY(crossfilter.${tableName}, ${copyToTable}) ?? fallback",
      ["copyToTable", "fallback"]
    ],
    [
      "FILTER_COPY(crossfilter.${tableName}, ${copyToTable}, field1 = field2) ?? fallback",
      ["copyToTable", "copyFields", "fallback"]
    ]
  ])("%s", (pattern, has) => {
    const expected = { tableName: expectedCustomValues.tableName }
    for (const key of has) {
      expected[key] = expectedCustomValues[key]
    }

    parseCrossFilterTokens(`\${${pattern}}`, opts)

    expect(crossfilterExtractorSpy).toHaveBeenCalledTimes(1)
    expect(crossfilterExtractorSpy).toHaveBeenCalledWith(
      expect.objectContaining(expected)
    )
  })
})
