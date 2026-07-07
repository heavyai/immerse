// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createNumericScaleSettings } from "vega/utils/binning"
import { VegaComboChartQuerySpec } from "../types"
import { buildComboQuery } from "./query-building"

describe("buildQuery", () => {
  it("Handles top N group filtering correctly", () => {
    const spec: VegaComboChartQuerySpec = {
      type: "vega-combo-chart",
      table: "tweets_2017_may",
      baseDimensions: [
        {
          type: "column",
          table: "tweets_2017_may",
          column: {
            name: "country",
            value: "country",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true
          }
        }
      ],
      groupByDimension: {
        type: "column",
        table: "tweets_2017_may",
        column: {
          name: "source",
          value: "source",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true
        }
      },
      sizeMeasures: [{ type: "count", table: "tweets_2017_may" }],
      colorMeasure: null,
      numberOfGroups: 500,
      nullDimensionsEnabled: false,
      appliedFilters: [],
      sortColumn: {
        col: {
          name: "measure0"
        },
        index: 0,
        order: "desc"
      },
      binSettings: null,
      joinFilters: []
    }

    const enabledTopNGroups = [
      "AhaRadio",
      "どこロコ。",
      "KuroTwi",
      "PLAYIT APP",
      "com1001_lab"
    ]

    const allOthersGroupEnabled = false

    const query = buildComboQuery({
      querySpec: spec,
      layerIndex: 0,
      minmax: null,
      numTopNGroups: undefined,
      enabledTopNGroups,
      allOthersGroupEnabled
    })

    // Expect dimension0 subquery to include WHERE with top N values
    const dimension0SubqueryWhere =
      "WHERE source IN ('AhaRadio','どこロコ。','KuroTwi','PLAYIT APP','com1001_lab')"

    // Expect country portion of main query WHERE to be wrapped in ()
    const mainQueryWhere =
      "WHERE (source IN ('AhaRadio','どこロコ。','KuroTwi','PLAYIT APP','com1001_lab') AND country IN (SELECT key0 FROM dimensionValues) AND country IS NOT NULL)"

    const expectedQuery = `WITH dimensionValues AS (SELECT country AS key0, count(*) AS measure0 FROM tweets_2017_may ${dimension0SubqueryWhere} GROUP BY key0 ORDER BY measure0 desc NULLS LAST LIMIT 500) SELECT count(*) AS measure0, source AS dimensionColor, country AS dimension0 FROM tweets_2017_may ${mainQueryWhere} GROUP BY dimension0, dimensionColor ORDER BY measure0 desc NULLS LAST`

    expect(query).toEqual(expectedQuery)
  })

  it("Handles numerical dimensions correctly", () => {
    const spec: VegaComboChartQuerySpec = {
      type: "vega-combo-chart",
      table: "tweets_2017_may",
      baseDimensions: [
        {
          type: "column",
          table: "tweets_nov_feb",
          column: {
            name: "tweet_count",
            value: "tweet_count",
            type: "INT",
            precision: 0,
            is_array: false,
            is_dict: false
          }
        }
      ],
      groupByDimension: null,
      sizeMeasures: [{ type: "count", table: "tweets_2017_may" }],
      colorMeasure: null,
      numberOfGroups: 500,
      nullDimensionsEnabled: true,
      appliedFilters: [],
      sortColumn: {
        col: {
          name: "measure0"
        },
        index: 0,
        order: "desc"
      },
      binSettings: createNumericScaleSettings(),
      joinFilters: []
    }

    const query = buildComboQuery({
      querySpec: spec,
      layerIndex: 0,
      minmax: { min: 0, max: 1123049 },
      numTopNGroups: 1
    })

    const expectedQuery =
      "SELECT count(*) AS measure0, CASE WHEN tweet_count >= 1123049 THEN 12 ELSE WIDTH_BUCKET(tweet_count, 0, 1123049, 12) END - 1 AS dimension0 FROM tweets_2017_may WHERE (tweet_count IS NOT NULL AND tweet_count >= 0 AND tweet_count <= 1123049) GROUP BY dimension0 HAVING ((dimension0 >= 0 AND dimension0 < 12) OR dimension0 IS NULL) ORDER BY measure0 desc NULLS LAST"

    expect(query).toEqual(expectedQuery)
  })

  it("Handles top N groups on layer above 0 correctly", () => {
    const spec: VegaComboChartQuerySpec = {
      type: "vega-combo-chart",
      table: "tweets_2017_may",
      baseDimensions: [
        {
          type: "column",
          table: "tweets_2017_may",
          column: {
            name: "country",
            value: "country",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true
          }
        }
      ],
      groupByDimension: {
        type: "column",
        table: "tweets_2017_may",
        column: {
          name: "source",
          value: "source",
          type: "STR",
          precision: 0,
          is_array: false,
          is_dict: true
        }
      },
      sizeMeasures: [{ type: "count", table: "tweets_2017_may" }],
      colorMeasure: null,
      numberOfGroups: 500,
      nullDimensionsEnabled: false,
      appliedFilters: [],
      sortColumn: {
        col: {
          name: "measure0"
        },
        index: 0,
        order: "desc"
      },
      binSettings: null,
      joinFilters: []
    }

    const enabledTopNGroups = [
      "AhaRadio",
      "どこロコ。",
      "KuroTwi",
      "PLAYIT APP",
      "com1001_lab"
    ]

    const allOthersGroupEnabled = false

    const query = buildComboQuery({
      querySpec: spec,
      layerIndex: 1,
      minmax: null,
      numTopNGroups: undefined,
      enabledTopNGroups,
      allOthersGroupEnabled
    })

    const dimension0SubqueryWhere =
      "WHERE source IN ('AhaRadio','どこロコ。','KuroTwi','PLAYIT APP','com1001_lab')"

    const mainQueryWhere =
      "WHERE (source IN ('AhaRadio','どこロコ。','KuroTwi','PLAYIT APP','com1001_lab') AND country IN (SELECT key0 FROM dimensionValues) AND country IS NOT NULL)"

    // Was ordering by 'dimension0' instead of measure for layer > 0
    const expectedQuery = `WITH dimensionValues AS (SELECT country AS key0, count(*) AS measure0 FROM tweets_2017_may ${dimension0SubqueryWhere} GROUP BY key0 ORDER BY measure0 desc NULLS LAST LIMIT 500) SELECT count(*) AS measure0, source AS dimensionColor, country AS dimension0 FROM tweets_2017_may ${mainQueryWhere} GROUP BY dimension0, dimensionColor ORDER BY measure0 desc NULLS LAST`

    expect(query).toEqual(expectedQuery)
  })

  it("Handles null dimensions enabled correctly", () => {
    const spec: VegaComboChartQuerySpec = {
      type: "vega-combo-chart",
      table: "tweets_2017_may",
      baseDimensions: [
        {
          type: "column",
          table: "tweets_2017_may",
          column: {
            name: "country",
            value: "country",
            type: "STR",
            precision: 0,
            is_array: false,
            is_dict: true
          }
        }
      ],
      groupByDimension: null,
      sizeMeasures: [{ type: "count", table: "tweets_2017_may" }],
      colorMeasure: null,
      numberOfGroups: 500,
      nullDimensionsEnabled: true,
      appliedFilters: [],
      sortColumn: {
        col: {
          name: "measure0"
        },
        index: 0,
        order: "desc"
      },
      binSettings: null,
      joinFilters: []
    }

    const nullsTrueExpectedQuery =
      "SELECT count(*) AS measure0, country AS dimension0 FROM tweets_2017_may GROUP BY dimension0 ORDER BY measure0 desc NULLS LAST LIMIT 500"

    expect(
      buildComboQuery({
        querySpec: spec,
        layerIndex: 0,
        minmax: null
      })
    ).toEqual(nullsTrueExpectedQuery)

    const nullsFalseExpectedQuery =
      "SELECT count(*) AS measure0, country AS dimension0 FROM tweets_2017_may WHERE country IS NOT NULL GROUP BY dimension0 ORDER BY measure0 desc NULLS LAST LIMIT 500"

    expect(
      buildComboQuery({
        querySpec: { ...spec, nullDimensionsEnabled: false },
        layerIndex: 0,
        minmax: null
      })
    ).toEqual(nullsFalseExpectedQuery)
  })
})
