// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compile } from "vega-lite"
import {
  histogram,
  barChart,
  layeredBarChart,
  lineChart,
  layeredLineChart,
  scatterplot,
  heatmap,
  vegaChoropleth
} from "./chart-generators/vega-generators"

describe("histogram function", () => {
  it("generates valid Vega-Lite spec", () => {
    const state = {
      x: {
        type: "quantitative",
        field: "G",
        numBins: 20,
        binning: true,
        active: true
      }
    }

    const result = histogram(state)

    const compiledSpec = compile(result.spec)
    expect(() => compiledSpec).not.toThrow()
  })
})

describe("barChart generator function", () => {
  describe("generates valid Vega-Lite spec with", () => {
    test("one string and one numeric field", () => {
      const state = {
        x: {
          field: "tmid",
          type: "nominal",
          active: true
        },
        y: {
          field: "g",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          g: 23,
          tmid: "DET"
        },
        {
          g: 42,
          tmid: "MTL"
        },
        {
          g: 16,
          tmid: "NYR"
        }
      ]

      const result = barChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two string and one numeric field", () => {
      const state = {
        x: {
          field: "tmid",
          type: "nominal",
          active: true
        },
        y: {
          field: "g",
          type: "quantitative",
          active: true
        },
        color: {
          field: "playerid",
          type: "nominal",
          active: true,
          required: false,
          assignedTo: "color"
        }
      }
      const data = [
        {
          g: 23,
          tmid: "DET",
          playerid: "pdatsyuk"
        },
        {
          g: 42,
          tmid: "MTL",
          playerid: "glafluer"
        },
        {
          g: 16,
          tmid: "NYR",
          playerid: "ckreider"
        }
      ]

      const result = barChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one string, one date and one numeric field", () => {
      const state = {
        x: {
          field: "tmid",
          type: "nominal",
          active: true
        },
        y: {
          field: "g",
          type: "quantitative",
          active: true
        },
        color: {
          field: "EXPR$0",
          type: "temporal",
          active: true
        }
      }
      const data = [
        {
          g: 23,
          tmid: "DET",
          EXPR$0: "2022-03-09T00:00:00.000Z"
        },
        {
          g: 42,
          tmid: "MTL",
          EXPR$0: "2022-03-10T00:00:00.000Z"
        },
        {
          g: 16,
          tmid: "NYR",
          EXPR$0: "2022-03-13T00:00:00.000Z"
        }
      ]

      const result = barChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two date and one numeric field", () => {
      const state = {
        x: {
          field: "EXPR$0",
          type: "temporal",
          active: true
        },
        y: {
          field: "EXPR$1",
          type: "temporal",
          active: true
        },
        color: {
          field: "tmid",
          type: "nominal",
          active: true
        }
      }
      const data = [
        {
          g: 23,
          EXPR$0: "2022-03-09T00:00:00.000Z",
          EXPR$1: "1970-01-01T00:00:21.000Z"
        },
        {
          g: 42,
          EXPR$0: "2022-03-10T00:00:00.000Z",
          EXPR$1: "1970-01-01T00:00:06.000Z"
        },
        {
          g: 16,
          EXPR$0: "2022-03-13T00:00:00.000Z",
          EXPR$1: "1970-01-01T00:00:15.000Z"
        }
      ]

      const result = barChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two numeric fields", () => {
      const state = {
        x: {
          field: "g",
          type: "quantitative",
          active: true
        },
        y: {
          field: "a",
          type: "quantitative",
          active: true
        },
        color: {
          field: "a",
          type: "quantitative",
          active: false,
          required: false,
          assignedTo: "color"
        }
      }
      const data = [
        {
          g: 17,
          a: 46
        },
        {
          g: 12,
          a: 28
        },
        {
          g: 29,
          a: 24
        }
      ]

      const result = barChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })
  })
})

describe("layeredBarChart generator function", () => {
  it("generates valid Vega-Lite spec", () => {
    const state = {
      x: {
        field: "tmid",
        type: "nominal",
        active: true
      },
      y1: {
        field: "goals",
        type: "quantitative",
        active: true
      },
      y2: {
        field: "assists",
        type: "quantitative",
        active: true
      },
      y3: {
        field: "g_w_g",
        type: "quantitative",
        active: true
      },
      y4: {
        field: "post_g",
        type: "quantitative",
        active: true
      },
      y5: {
        field: "post_a",
        type: "quantitative",
        active: true
      }
    }
    const data = [
      {
        goals: 19896,
        assists: 30222,
        g_w_g: 1968,
        post_g: 2121,
        post_a: 3216,
        tmid: "MTL"
      },
      {
        goals: 19067,
        assists: 29610,
        g_w_g: 1879,
        post_g: 1669,
        post_a: 2591,
        tmid: "BOS"
      },
      {
        goals: 11260,
        assists: 18888,
        g_w_g: 1382,
        post_g: 606,
        post_a: 973,
        tmid: "LAK"
      }
    ]

    const result = layeredBarChart(state, data)

    const compiledSpec = compile(result.spec)
    expect(() => compiledSpec).not.toThrow()
  })
})

describe("lineChart generator function", () => {
  describe("generates valid Vega-Lite spec with", () => {
    test("one date, one numeric and one string field", () => {
      const state = {
        x: {
          field: "EXPR$0",
          type: "temporal",
          active: true
        },
        y: {
          field: "total_shot_distance",
          type: "quantitative",
          active: true
        },
        color: {
          field: "team",
          type: "nominal",
          active: true
        }
      }
      const data = [
        {
          EXPR$0: "2022-03-09T00:00:00.000Z",
          total_shot_distance: 1376,
          team: "PHX"
        },
        {
          EXPR$0: "2021-11-10T00:00:00.000Z",
          total_shot_distance: 1485,
          team: "MIN"
        },
        {
          EXPR$0: "2022-11-13T00:00:00.000Z",
          total_shot_distance: 1519,
          team: "GSW"
        }
      ]

      const result = lineChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two date and one numeric field", () => {
      const state = {
        x: {
          field: "EXPR$0",
          type: "temporal",
          active: true
        },
        y: {
          field: "_points",
          type: "quantitative",
          active: true
        },
        color: {
          field: "EXPR$1",
          type: "temporal",
          active: false,
          required: false,
          assignedTo: "color"
        }
      }
      const data = [
        {
          EXPR$0: "2022-01-18T00:00:00.000Z",
          EXPR$1: "1970-01-01T00:00:21.000Z",
          _points: 9
        },
        {
          EXPR$0: "2023-02-25T00:00:00.000Z",
          EXPR$1: "1970-01-01T00:00:15.000Z",
          _points: 59
        },
        {
          EXPR$0: "2021-12-21T00:00:00.000Z",
          EXPR$1: "1970-01-01T00:00:06.000Z",
          _points: 34
        }
      ]

      const result = lineChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one date and one numeric field", () => {
      const state = {
        x: {
          field: "EXPR$0",
          type: "temporal",
          active: true
        },
        y: {
          field: "_points",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          EXPR$0: "2022-01-18T00:00:00.000Z",
          _points: 9
        },
        {
          EXPR$0: "2023-02-25T00:00:00.000Z",
          _points: 59
        },
        {
          EXPR$0: "2021-12-21T00:00:00.000Z",
          _points: 34
        }
      ]

      const result = lineChart(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })
  })
})

describe("layeredLineChart generator function", () => {
  it("generates valid Vega-Lite spec", () => {
    const state = {
      x: {
        field: "EXPR$0",
        type: "temporal"
      },
      y1: {
        field: "_home_score",
        type: "quantitative",
        active: true
      },
      y2: {
        field: "_away_score",
        type: "quantitative",
        active: true
      },
      y3: {
        field: "_shot_distance",
        type: "quantitative",
        active: true
      },
      y4: {
        field: "_points",
        type: "quantitative",
        active: true
      }
    }
    const data = [
      {
        EXPR$0: "2023-04-19T00:00:00.000Z",
        _home_score: 31055,
        _away_score: 25076,
        _shot_distance: 7257,
        _points: 573
      },
      {
        EXPR$0: "2023-04-21T00:00:00.000Z",
        _home_score: 26263,
        _away_score: 25115,
        _shot_distance: 7075,
        _points: 530
      },
      {
        EXPR$0: "2023-04-29T00:00:00.000Z",
        _home_score: 11287,
        _away_score: 9550,
        _shot_distance: 2488,
        _points: 191
      }
    ]

    const result = layeredLineChart(state, data)

    const compiledSpec = compile(result.spec)
    expect(() => compiledSpec).not.toThrow()
  })
})

describe("scatterplot generator function", () => {
  describe("generates valid Vega-Lite spec with", () => {
    test("one date, one numeric and one string field", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "total_points",
          type: "quantitative",
          active: true
        },
        color: {
          field: "player",
          type: "nominal",
          active: true
        },
        size: {
          field: "player",
          type: "nominal",
          active: false,
          required: false,
          assignedTo: "size"
        }
      }
      const data = [
        {
          _day: "2022-01-15T00:00:00.000Z",
          total_points: 26,
          player: "Jeff Green"
        },
        {
          _day: "2021-12-08T00:00:00.000Z",
          total_points: 28,
          player: "Jerami Grant"
        },
        {
          _day: "2021-12-04T00:00:00.000Z",
          total_points: 28,
          player: "Terence Davis"
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one date, one numeric and two string fields", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "total_points",
          type: "quantitative",
          active: true
        },
        color: {
          field: "player",
          type: "nominal",
          active: true
        },
        size: {
          field: "team",
          type: "nominal",
          active: true
        }
      }
      const data = [
        {
          _day: "2022-11-21T00:00:00.000Z",
          total_points: 25,
          player: "Jaylen Brown",
          team: "BOS"
        },
        {
          _day: "2021-11-18T00:00:00.000Z",
          total_points: 30,
          player: "Bradley Beal",
          team: "WAS"
        },
        {
          _day: "2022-11-11T00:00:00.000Z",
          total_points: 40,
          player: "Stephen Curry",
          team: "GSW"
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two date and one numeric field", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "_hour",
          type: "temporal",
          active: true
        },
        color: {
          field: "points",
          type: "quantitative",
          active: true
        },
        size: {
          field: "points",
          type: "quantitative",
          active: false,
          required: false,
          assignedTo: "size"
        }
      }
      const data = [
        {
          _day: "2021-10-23T00:00:00.000Z",
          _hour: "2021-10-23T00:00:00.000Z",
          points: 2
        },
        {
          _day: "2021-10-20T00:00:00.000Z",
          _hour: "2021-10-20T00:00:00.000Z",
          points: 3
        },
        {
          _day: "2021-10-22T00:00:00.000Z",
          _hour: "2021-10-22T00:00:00.000Z",
          points: null
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("three date and one numeric field", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "_hour",
          type: "temporal",
          active: true
        },
        color: {
          field: "points",
          type: "quantitative",
          active: true
        },
        size: {
          field: "points",
          type: "quantitative",
          active: false,
          required: false,
          assignedTo: "size"
        }
      }
      const data = [
        {
          _day: "2021-10-20T00:00:00.000Z",
          _hour: "2021-10-20T00:00:00.000Z",
          _minute: "2021-10-20T00:00:00.000Z",
          points: 0
        },
        {
          _day: "2021-10-20T00:00:00.000Z",
          _hour: "2021-10-20T00:00:00.000Z",
          _minute: "2021-10-20T00:00:00.000Z",
          points: 2
        },
        {
          _day: "2021-10-19T00:00:00.000Z",
          _hour: "2021-10-19T00:00:00.000Z",
          _minute: "2021-10-19T00:00:00.000Z",
          points: null
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two date and one string field", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "_hour",
          type: "temporal",
          active: true
        },
        color: {
          field: "team",
          type: "nominal",
          active: true
        },
        size: {
          field: "_day",
          type: "temporal",
          active: false,
          required: false,
          assignedTo: "size"
        }
      }
      const data = [
        {
          _day: "2021-10-20T00:00:00.000Z",
          _hour: "2021-10-20T00:00:00.000Z",
          team: "OKC"
        },
        {
          _day: "2021-10-23T00:00:00.000Z",
          _hour: "2021-10-23T00:00:00.000Z",
          team: null
        },
        {
          _day: "2021-10-22T00:00:00.000Z",
          _hour: "2021-10-22T00:00:00.000Z",
          team: "NYK"
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("three date and one string field", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "_hour",
          type: "temporal",
          active: true
        },
        color: {
          field: "team",
          type: "nominal",
          active: true
        },
        size: {
          field: "_minute",
          type: "temporal",
          active: true
        }
      }
      const data = [
        {
          _day: "2021-10-22T00:00:00.000Z",
          _hour: "2021-10-22T00:00:00.000Z",
          _minute: "2021-10-22T00:00:00.000Z",
          team: "PHI"
        },
        {
          _day: "2021-10-19T00:00:00.000Z",
          _hour: "2021-10-19T00:00:00.000Z",
          _minute: "2021-10-19T00:00:00.000Z",
          team: "GSW"
        },
        {
          _day: "2021-10-21T00:00:00.000Z",
          _hour: "2021-10-21T00:00:00.000Z",
          _minute: "2021-10-21T00:00:00.000Z",
          team: "GSW"
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("two numeric and one string field", () => {
      const state = {
        x: {
          field: "_postg",
          type: "quantitative",
          active: true
        },
        y: {
          field: "_posta",
          type: "quantitative",
          active: true
        },
        color: {
          field: "tmid",
          type: "nominal",
          active: true
        },
        size: {
          field: "tmid",
          type: "nominal",
          active: false,
          required: false,
          assignedTo: "size"
        }
      }
      const data = [
        {
          _postg: 181,
          _posta: 303,
          tmid: "TBL"
        },
        {
          _postg: 685,
          _posta: 1165,
          tmid: "NJD"
        },
        {
          _postg: 479,
          _posta: 832,
          tmid: "COL"
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("three numeric and one string field", () => {
      const state = {
        x: {
          field: "_postg",
          type: "quantitative",
          active: true
        },
        y: {
          field: "_posta",
          type: "quantitative",
          active: true
        },
        color: {
          field: "tmid",
          type: "nominal",
          active: true
        },
        size: {
          field: "_postpim",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          _postg: 2121,
          _posta: 3216,
          tmid: "MTL",
          _postpim: 11043
        },
        {
          _postg: 1260,
          _posta: 2019,
          tmid: "PHI",
          _postpim: 8553
        },
        {
          _postg: 612,
          _posta: 1037,
          tmid: "VAN",
          _postpim: 4296
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("three numeric fields", () => {
      const state = {
        x: {
          field: "g",
          type: "quantitative",
          active: true
        },
        y: {
          field: "a",
          type: "quantitative",
          active: true
        },
        color: {
          field: "pim",
          type: "quantitative",
          active: true
        },
        size: {
          field: "a",
          type: "quantitative",
          active: false,
          required: false,
          assignedTo: "size"
        }
      }
      const data = [
        {
          g: 2,
          a: 3,
          pim: 100
        },
        {
          g: 12,
          a: 23,
          pim: 96
        },
        {
          g: 35,
          a: 30,
          pim: 27
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("four numeric fields", () => {
      const state = {
        x: {
          field: "g",
          type: "quantitative",
          active: true
        },
        y: {
          field: "a",
          type: "quantitative",
          active: true
        },
        color: {
          field: "gp",
          type: "quantitative",
          active: true
        },
        size: {
          field: "pim",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          g: 37,
          a: 23,
          gp: 80,
          pim: 271
        },
        {
          g: 20,
          a: 13,
          gp: 61,
          pim: 40
        },
        {
          g: 36,
          a: 25,
          gp: 80,
          pim: 32
        }
      ]

      const result = scatterplot(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })
  })
})

describe("heatmap generator function", () => {
  describe("generates valid Vega-Lite spec with", () => {
    test("two date and one numeric field", () => {
      const state = {
        x: {
          field: "_day",
          type: "temporal",
          active: true
        },
        y: {
          field: "_hour",
          type: "temporal",
          active: true
        },
        color: {
          field: "shot_distance",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          _day: "2021-10-21T00:00:00.000Z",
          _hour: "2021-10-21T00:00:00.000Z",
          shot_distance: null
        },
        {
          _day: "2021-10-23T00:00:00.000Z",
          _hour: "2021-10-23T00:00:00.000Z",
          shot_distance: 8
        },
        {
          _day: "2021-10-22T00:00:00.000Z",
          _hour: "2021-10-22T00:00:00.000Z",
          shot_distance: null
        }
      ]

      const result = heatmap(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("three numeric fields", () => {
      const state = {
        x: {
          field: "g",
          type: "quantitative",
          active: true
        },
        y: {
          field: "a",
          type: "quantitative",
          active: true
        },
        color: {
          field: "pim",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          g: 6,
          a: 44,
          pim: 30
        },
        {
          g: 15,
          a: 16,
          pim: 146
        },
        {
          g: 23,
          a: 45,
          pim: 93
        }
      ]

      const result = heatmap(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one date and two numeric fields", () => {
      const state = {
        x: {
          field: "EXPR$0",
          type: "temporal",
          active: true
        },
        y: {
          field: "shot_distance",
          type: "quantitative",
          active: true
        },
        color: {
          field: "away_score",
          type: "quantitative",
          active: true
        }
      }
      const data = [
        {
          EXPR$0: "2021-10-22T00:00:00.000Z",
          shot_distance: 18,
          away_score: 100
        },
        {
          EXPR$0: "2021-10-23T00:00:00.000Z",
          shot_distance: 27,
          away_score: 35
        },
        {
          EXPR$0: "2021-10-23T00:00:00.000Z",
          shot_distance: null,
          away_score: 15
        }
      ]

      const result = heatmap(state, data)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })
  })
})

describe("vegaChoropleth generator function", () => {
  describe("generates valid Vega-Lite spec with", () => {
    test("one join string field and one numeric field", () => {
      const state = {
        color: {
          field: "population",
          type: "quantitative",
          active: true
        },
        join: {
          field: "state_abbr",
          type: "nominal",
          joinField: "state_abbr",
          joinDataset: "states",
          active: true
        }
      }
      const data = [
        {
          state_abbr: "OH",
          population: 11755535,
          state_abbr_join: "OH"
        },
        {
          state_abbr: "CA",
          population: 39611295,
          state_abbr_join: "CA"
        },
        {
          state_abbr: "LA",
          population: 4786046,
          state_abbr_join: "LA"
        }
      ]
      const settings = {
        border: true
      }

      const result = vegaChoropleth(state, data, settings)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one join numeric field and one string field", () => {
      const state = {
        color: {
          field: "EXPR$1",
          type: "nominal",
          active: true
        },
        join: {
          field: "fips_int",
          type: "quantitative",
          joinField: "id",
          joinDataset: "counties",
          active: true
        }
      }
      const data = [
        {
          fips_int: 48099,
          EXPR$1: "TXaa",
          fips_int_join: 48099
        },
        {
          fips_int: 36077,
          EXPR$1: "NYaa",
          fips_int_join: 36077
        },
        {
          fips_int: 36085,
          EXPR$1: "NYaa",
          fips_int_join: 36085
        }
      ]
      const settings = {
        border: true
      }

      const result = vegaChoropleth(state, data, settings)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one join string field and one non-join string field", () => {
      const state = {
        color: {
          field: "sub_region",
          type: "nominal",
          active: true
        },
        join: {
          field: "state_name",
          type: "nominal",
          joinField: "state_name",
          joinDataset: "states",
          active: true
        }
      }
      const data = [
        {
          state_name: "Colorado",
          sub_region: "Mountain",
          state_name_join: "COLORADO"
        },
        {
          state_name: "Florida",
          sub_region: "South Atlantic",
          state_name_join: "FLORIDA"
        },
        {
          state_name: "Illinois",
          sub_region: "East North Central",
          state_name_join: "ILLINOIS"
        }
      ]
      const settings = {
        border: true
      }

      const result = vegaChoropleth(state, data, settings)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one join string field and one date field", () => {
      const state = {
        color: {
          field: "EXPR$1",
          type: "temporal",
          active: true
        },
        join: {
          field: "dest_state",
          type: "nominal",
          joinField: "state_abbr",
          joinDataset: "states",
          active: true
        }
      }
      const data = [
        {
          dest_state: "TN",
          EXPR$1: "2008-01-07T00:00:00.000Z",
          dest_state_join: "TN"
        },
        {
          dest_state: "AZ",
          EXPR$1: "2008-01-07T00:00:00.000Z",
          dest_state_join: "AZ"
        },
        {
          dest_state: "NY",
          EXPR$1: "2008-01-07T00:00:00.000Z",
          dest_state_join: "NY"
        }
      ]
      const settings = {
        border: true
      }

      const result = vegaChoropleth(state, data, settings)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one join numeric field and one date field", () => {
      const state = {
        color: {
          field: "EXPR$1",
          type: "temporal",
          active: true
        },
        join: {
          field: "fips_int",
          type: "quantitative",
          joinField: "id",
          joinDataset: "counties",
          active: true
        }
      }
      const data = [
        {
          fips_int: 48099,
          EXPR$1: "2008-01-07T00:00:00.000Z",
          fips_int_join: 48099
        },
        {
          fips_int: 36077,
          EXPR$1: "2008-01-07T00:00:00.000Z",
          fips_int_join: 36077
        },
        {
          fips_int: 36085,
          EXPR$1: "2008-01-07T00:00:00.000Z",
          fips_int_join: 36085
        }
      ]
      const settings = {
        border: true
      }

      const result = vegaChoropleth(state, data, settings)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })

    test("one join numeric field and one non-join numeric field", () => {
      const state = {
        color: {
          field: "med_age",
          type: "quantitative",
          active: true
        },
        join: {
          field: "fips_int",
          type: "quantitative",
          joinField: "id",
          joinDataset: "counties",
          active: true
        }
      }
      const data = [
        {
          fips_int: 13321,
          med_age: 39.6,
          fips_int_join: 13321
        },
        {
          fips_int: 15007,
          med_age: 41.4,
          fips_int_join: 15007
        },
        {
          fips_int: 19171,
          med_age: 41.8,
          fips_int_join: 19171
        }
      ]
      const settings = {
        border: true
      }

      const result = vegaChoropleth(state, data, settings)

      const compiledSpec = compile(result.spec)
      expect(() => compiledSpec).not.toThrow()
    })
  })
})
