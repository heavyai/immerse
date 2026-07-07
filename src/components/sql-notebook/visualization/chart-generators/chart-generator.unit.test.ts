// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateCharts } from "../utils"
import { ChartTypes } from "../../types"

describe("generateCharts", () => {
  test("generates a bar chart for 1 string and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "g",
          type: "BIGINT",
          is_array: false
        },
        {
          name: "tmid",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        { g: 100, tmid: "MTL" },
        { g: 87, tmid: "CHI" },
        { g: 75, tmid: "CBJ" }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.BAR)
  })

  test("generates line chart and scatterplot for 1 numeric and 1 temporal field", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-22T00:00:00.000Z",
          points: 2
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          points: 3
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          points: null
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(2)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  test("generates bar chart and scatterplot for 2 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "g",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "a",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        { g: 54, a: 137 },
        { g: 17, a: 42 },
        { g: 5, a: 38 }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(2)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  test("generates a scatterplot for 2 temporal fields", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "minute_",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-22T00:00:00.000Z",
          minute_: "2021-10-22T00:00:00.000Z"
        },
        {
          hour_: "2021-10-23T00:00:00.000Z",
          minute_: "2021-10-23T00:00:00.000Z"
        },
        {
          hour_: "2021-10-20T00:00:00.000Z",
          minute_: "2021-10-20T00:00:00.000Z"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.SCATTER)
  })

  test("generates line chart, bar chart and scatterplot for 1 temporal, 1 string, and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "EXPR$0",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "player",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          EXPR$0: "2021-10-22T00:00:00.000Z",
          points: 3,
          player: "Spencer Dinwiddie"
        },
        {
          EXPR$0: "2021-10-22T00:00:00.000Z",
          points: 0,
          player: "Myles Turner"
        },
        {
          EXPR$0: "2021-10-22T00:00:00.000Z",
          points: 0,
          player: "Wendell Carter Jr."
        },
        {
          EXPR$0: "2021-10-22T00:00:00.000Z",
          points: null,
          player: null
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
  })

  test("generates scatterplot for 2 temporal and 1 string field", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "player",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-19T00:00:00.000Z",
          day_: "2021-10-19T00:00:00.000Z",
          player: "Anthony Davis"
        },
        {
          hour_: "2021-10-19T00:00:00.000Z",
          day_: "2021-10-19T00:00:00.000Z",
          player: "LeBron James"
        },
        {
          hour_: "2021-10-19T00:00:00.000Z",
          day_: "2021-10-19T00:00:00.000Z",
          player: "Avery Bradley"
        },
        {
          hour_: "2021-10-19T00:00:00.000Z",
          day_: "2021-10-19T00:00:00.000Z",
          player: "Kent Bazemore"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.SCATTER)
  })

  test("generates line chart, bar chart, scatterplot and heatmap for 2 temporal and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          points: null,
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z"
        },
        {
          points: 2,
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z"
        },
        {
          points: 0,
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z"
        },
        {
          points: 3,
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  test("generates scatterplot for 3 temporal fields", () => {
    const data = {
      fields: [
        {
          name: "minute_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          minute_: "2021-10-20T00:00:00.000Z",
          hour_: "2021-10-20T00:00:00.000Z",
          day_: "2021-10-20T00:00:00.000Z"
        },
        {
          minute_: "2021-10-24T00:00:00.000Z",
          hour_: "2021-10-24T00:00:00.000Z",
          day_: "2021-10-24T00:00:00.000Z"
        },
        {
          minute_: "2021-10-22T00:00:00.000Z",
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z"
        },
        {
          minute_: "2021-10-23T00:00:00.000Z",
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.SCATTER)
  })

  test("generates a bar chart for 2 string and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "tmid",
          type: "STR",
          is_array: false
        },
        {
          name: "playerid",
          type: "STR",
          is_array: false
        },
        {
          name: "postg_",
          type: "BIGINT",
          is_array: false
        }
      ],
      results: [
        {
          tmid: "ANA",
          playerid: "chistst01",
          postg_: 4
        },
        {
          tmid: "DET",
          playerid: "datsypa01",
          postg_: 33
        },
        {
          tmid: "NYR",
          playerid: "malondo01",
          postg_: 22
        },
        {
          tmid: "CHI",
          playerid: "northba01",
          postg_: null
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.BAR)
  })

  // 2 string and 1 temporal?  currently no path, not sure if useful
  test("generates layered line chart, line chart, bar chart, scatterplot and heatmap for 2 numeric and 1 temporal field", () => {
    const data = {
      fields: [
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "period_",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          points: 3,
          period_: 2,
          hour_: "2021-10-23T00:00:00.000Z"
        },
        {
          points: 2,
          period_: 2,
          hour_: "2021-10-23T00:00:00.000Z"
        },
        {
          points: null,
          period_: 3,
          hour_: "2021-10-20T00:00:00.000Z"
        },
        {
          points: 1,
          period_: 3,
          hour_: "2021-10-20T00:00:00.000Z"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(5)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  test("generates layered bar chart and scatterplot for 2 numeric and 1 string field", () => {
    const data = {
      fields: [
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "period_",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          points: 2,
          period_: 1,
          team: "PHX"
        },
        {
          points: 3,
          period_: 1,
          team: "SAS"
        },
        {
          points: null,
          period_: 3,
          team: "CLE"
        },
        {
          points: 0,
          period_: 1,
          team: "NYK"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    // This should also have a bar chart because it has two numeric fields
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
  })

  test("generates bar chart, scatterplot and heatmap for 3 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "g",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "a",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "pim",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          g: 51,
          a: 53,
          pim: 136
        },
        {
          g: 40,
          a: 45,
          pim: 186
        },
        {
          g: 0,
          a: 1,
          pim: 10
        },
        {
          g: 33,
          a: 39,
          pim: 26
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 1 temporal, 2 string, 1 numeric
  test("generates bar chart, line chart and scatterplot for 1 temporal, 2 string and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "player",
          type: "STR",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-19T00:00:00.000Z",
          player: "Dwight Howard",
          team: "LAL",
          points: null
        },
        {
          hour_: "2021-10-20T00:00:00.000Z",
          player: "Nikola Jokic",
          team: "DEN",
          points: 2
        },
        {
          hour_: "2021-10-21T00:00:00.000Z",
          player: "Clint Capela",
          team: "ATL",
          points: null
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          player: "Justin Holiday",
          team: "IND",
          points: null
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  // 1 temporal, 1 string, 2 numeric
  test("generates bar, layered bar, line, layered line, scatterplot and heatmap for 1 temporal, 1 string and 2 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-24T00:00:00.000Z",
          team: "CHA",
          points: 2,
          home_score: 0
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          team: "BKN",
          points: null,
          home_score: 102
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          team: "OKC",
          points: null,
          home_score: 25
        },
        {
          hour_: "2021-10-21T00:00:00.000Z",
          team: "MIL",
          points: 0,
          home_score: 51
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(6)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 1 temporal, 3 string
  // no charts

  // 1 temporal, 3 numeric
  test("generates layered line, line, bar, scatterplot and heatmap for 1 temporal and 3 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "EXPR$0",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "away_score",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          EXPR$0: "2021-10-21T00:00:00.000Z",
          points: 2,
          home_score: 47,
          away_score: 27
        },
        {
          EXPR$0: "2021-10-22T00:00:00.000Z",
          points: null,
          home_score: 50,
          away_score: 44
        },
        {
          EXPR$0: "2021-10-23T00:00:00.000Z",
          points: 1,
          home_score: 75,
          away_score: 91
        },
        {
          EXPR$0: "2021-10-19T00:00:00.000Z",
          points: 3,
          home_score: 50,
          away_score: 37
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(5)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 2 temporal, 1 string, 1 numeric
  // TODO: Generates a heatmap for this as well because this satisfies 2 temporal and 1 numeric
  test("generates bar, line, heatmap, and scatterplot for 2 temporal, 1 string and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          points: null,
          team: "PHX"
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          points: 3,
          team: "SAS"
        },
        {
          hour_: "2021-10-24T00:00:00.000Z",
          day_: "2021-10-24T00:00:00.000Z",
          points: 1,
          team: "CHA"
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          points: 2,
          team: "IND"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    // 2 date one string matches heatmap
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 2 temporal, 2 string
  test("generates scatterplot for 2 temporal and 2 string fields", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "player",
          type: "STR",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          player: "John Collins",
          team: "ATL"
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          player: "Mike Muscala",
          team: "OKC"
        },
        {
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          player: "Steven Adams",
          team: "MEM"
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          player: "Malcolm Brogdon",
          team: "IND"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.SCATTER)
  })

  // 2 temporal, 2 numeric
  test("generates layered line, bar, scatterplot and heatmap for 2 temporal and 2 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "away_score",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          home_score: 13,
          away_score: 12
        },
        {
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          home_score: 58,
          away_score: 53
        },
        {
          hour_: "2021-10-20T00:00:00.000Z",
          day_: "2021-10-20T00:00:00.000Z",
          home_score: 20,
          away_score: 25
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          home_score: 131,
          away_score: 131
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(5)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 3 temporal, 1 string
  test("generates scatterplot for 3 temporal and 1 string field", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "min_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          min_: "2021-10-23T00:00:00.000Z",
          team: "MIL"
        },
        {
          hour_: "2021-10-20T00:00:00.000Z",
          day_: "2021-10-20T00:00:00.000Z",
          min_: "2021-10-20T00:00:00.000Z",
          team: "HOU"
        },
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          min_: "2021-10-22T00:00:00.000Z",
          team: "NYK"
        },
        {
          hour_: "2021-10-19T00:00:00.000Z",
          day_: "2021-10-19T00:00:00.000Z",
          min_: "2021-10-19T00:00:00.000Z",
          team: "MIL"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.SCATTER)
  })

  // 3 temporal, 1 numeric
  test("generates line, bar, scatterplot and heatmap for 3 temporal and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "min_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          min_: "2021-10-22T00:00:00.000Z",
          home_score: 63
        },
        {
          hour_: "2021-10-20T00:00:00.000Z",
          day_: "2021-10-20T00:00:00.000Z",
          min_: "2021-10-20T00:00:00.000Z",
          home_score: 63
        },
        {
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          min_: "2021-10-23T00:00:00.000Z",
          home_score: 7
        },
        {
          hour_: "2021-10-21T00:00:00.000Z",
          day_: "2021-10-21T00:00:00.000Z",
          min_: "2021-10-21T00:00:00.000Z",
          home_score: 57
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 1 string, 2 numeric, 1 temporal
  test("generates layered bar, bar, line, layered line, scatterplot and heatmap for 1 string, 2 numeric and 1 temporal field", () => {
    const data = {
      fields: [
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "away_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          day_: "2021-10-19T00:00:00.000Z",
          away_score: 20,
          home_score: 33,
          team: "BKN"
        },
        {
          day_: "2021-10-20T00:00:00.000Z",
          away_score: 51,
          home_score: 75,
          team: "OKC"
        },
        {
          day_: "2021-10-23T00:00:00.000Z",
          away_score: 80,
          home_score: 85,
          team: "ATL"
        },
        {
          day_: "2021-10-22T00:00:00.000Z",
          away_score: 11,
          home_score: 12,
          team: "SAC"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(6)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 2 string, 2 numeric
  test("generates layered bar, bar and scatterplot for 2 string and 2 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "player",
          type: "STR",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        },
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "away_score",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          player: "Precious Achiuwa",
          team: "TOR",
          home_score: 7,
          away_score: 12
        },
        {
          player: "Evan Mobley",
          team: "CLE",
          home_score: 86,
          away_score: 80
        },
        {
          player: "Cedi Osman",
          team: "CLE",
          home_score: 99,
          away_score: 112
        },
        {
          player: "OG Anunoby",
          team: "TOR",
          home_score: 7,
          away_score: 12
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  // 3 string, 1 numeric
  test("generates bar chart for 3 string and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "player",
          type: "STR",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        },
        {
          name: "a1",
          type: "STR",
          is_array: false
        },
        {
          name: "points",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          player: "Robert Covington",
          team: "POR",
          a1: "Terence Davis",
          points: null
        },
        {
          player: "Goran Dragic",
          team: "TOR",
          a1: "Spencer Dinwiddie",
          points: 2
        },
        {
          player: "Duncan Robinson",
          team: "MIA",
          a1: "Sandro Mamukelashvili",
          points: 3
        },
        {
          player: "Tyler Herro",
          team: "MIA",
          a1: "Bam Adebayo",
          points: 3
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.BAR)
  })

  // 3 numeric, 1 string
  // TODO: This also generates a bar chart.. which seems like it should?
  test("generates layered bar, scatterplot and heatmap for 3 numeric and 1 string field", () => {
    const data = {
      fields: [
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "away_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "shot_distance",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "team",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          home_score: 21,
          away_score: 14,
          shot_distance: 23,
          team: "NOP"
        },
        {
          home_score: 100,
          away_score: 68,
          shot_distance: 2,
          team: "HOU"
        },
        {
          home_score: 69,
          away_score: 65,
          shot_distance: 2,
          team: "SAC"
        },
        {
          home_score: 113,
          away_score: 82,
          shot_distance: null,
          team: "MIN"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 4 temporal
  test("generates scatterplot for 4 temporal fields", () => {
    const data = {
      fields: [
        {
          name: "minute_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "hour_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "day_",
          type: "TIMESTAMP",
          is_array: false
        },
        {
          name: "week_",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          minute_: "2021-10-20T00:00:00.000Z",
          hour_: "2021-10-20T00:00:00.000Z",
          day_: "2021-10-20T00:00:00.000Z",
          week_: "2021-10-18T00:00:00.000Z"
        },
        {
          minute_: "2021-10-23T00:00:00.000Z",
          hour_: "2021-10-23T00:00:00.000Z",
          day_: "2021-10-23T00:00:00.000Z",
          week_: "2021-10-18T00:00:00.000Z"
        },
        {
          minute_: "2021-10-22T00:00:00.000Z",
          hour_: "2021-10-22T00:00:00.000Z",
          day_: "2021-10-22T00:00:00.000Z",
          week_: "2021-10-18T00:00:00.000Z"
        },
        {
          minute_: "2021-10-20T00:00:00.000Z",
          hour_: "2021-10-20T00:00:00.000Z",
          day_: "2021-10-20T00:00:00.000Z",
          week_: "2021-10-18T00:00:00.000Z"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.SCATTER)
  })

  // 4 numeric
  test("generates bar, scatterplot and heatmap for 4 numeric fields", () => {
    const data = {
      fields: [
        {
          name: "home_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "away_score",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "converted_x",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "converted_y",
          type: "FLOAT",
          is_array: false
        }
      ],
      results: [
        {
          home_score: 94,
          away_score: 103,
          converted_x: null,
          converted_y: null
        },
        {
          home_score: 26,
          away_score: 29,
          converted_x: 26.200000762939453,
          converted_y: 5.900000095367432
        },
        {
          home_score: 12,
          away_score: 8,
          converted_x: 48.20000076293945,
          converted_y: 8.399999618530273
        },
        {
          home_score: 26,
          away_score: 31,
          converted_x: 25,
          converted_y: 5
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  test("generates vega choropleth and bar chart for 1 join string field and 1 numeric field", () => {
    const data = {
      fields: [
        {
          name: "state_name",
          type: "STR",
          is_array: false
        },
        {
          name: "population",
          type: "INT",
          is_array: false
        }
      ],
      results: [
        {
          state_name: "Alaska",
          population: 744733,
          state_name_join: "ALASKA"
        },
        {
          state_name: "Ohio",
          population: 11755535,
          state_name_join: "OHIO"
        },
        {
          state_name: "Illinois",
          population: 13027812,
          state_name_join: "ILLINOIS"
        },
        {
          state_name: "Arizona",
          population: 7031568,
          state_name_join: "ARIZONA"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(2)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.VEGA_CHOROPLETH })
    )
  })

  test("generates vega choropleth for 1 join string field and 1 temporal field", () => {
    const data = {
      fields: [
        {
          name: "origin_state",
          type: "STR",
          is_array: false
        },
        {
          name: "EXPR$1",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          origin_state: "TX",
          EXPR$1: "2008-01-06T00:00:00.000Z",
          origin_state_join: "TX"
        },
        {
          origin_state: "CA",
          EXPR$1: "2008-01-06T00:00:00.000Z",
          origin_state_join: "CA"
        },
        {
          origin_state: "OH",
          EXPR$1: "2008-01-06T00:00:00.000Z",
          origin_state_join: "OH"
        },
        {
          origin_state: "TX",
          EXPR$1: "2008-01-06T00:00:00.000Z",
          origin_state_join: "TX"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.VEGA_CHOROPLETH)
  })

  test("generates vega choropleth for 1 join string field and 1 non-join string field", () => {
    const data = {
      fields: [
        {
          name: "origin_state",
          type: "STR",
          is_array: false
        },
        {
          name: "plane_model",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          origin_state: "NH",
          plane_model: "737-7H4"
        },
        {
          origin_state: "IL",
          plane_model: "737-3H4"
        },
        {
          origin_state: "CA",
          plane_model: "65-A90"
        },
        {
          origin_state: "TX",
          plane_model: "737-3Y0"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.VEGA_CHOROPLETH)
  })

  test("generates vega choropleth and bar chart for 1 join numeric field and 1 string field", () => {
    const data = {
      fields: [
        {
          name: "fips_",
          type: "INT",
          is_array: false
        },
        {
          name: "state_name_",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          fips_: 13279,
          state_name_: "GeorgiaAAA",
          fips__join: 13279
        },
        {
          fips_: 26027,
          state_name_: "MichiganAAA",
          fips__join: 26027
        },
        {
          fips_: 38013,
          state_name_: "North DakotaAAA",
          fips__join: 38013
        },
        {
          fips_: 45089,
          state_name_: "South CarolinaAAA",
          fips__join: 45089
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(2)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.VEGA_CHOROPLETH })
    )
  })

  test("generates vega choropleth, bar chart and scatterplot for 1 join numeric field and 1 non-join numeric field", () => {
    const data = {
      fields: [
        {
          name: "fips_",
          type: "INT",
          is_array: false
        },
        {
          name: "population",
          type: "INT",
          is_array: false
        }
      ],
      results: [
        {
          fips_: 51059,
          population: 1143250,
          fips__join: 51059
        },
        {
          fips_: 36089,
          population: 111189,
          fips__join: 36089
        },
        {
          fips_: 48491,
          population: 604276,
          fips__join: 48491
        },
        {
          fips_: 48493,
          population: 52083,
          fips__join: 48493
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.VEGA_CHOROPLETH })
    )
  })

  test("generates vega choropleth, line chart and scatterplot for 1 join numeric field and 1 temporal field", () => {
    const data = {
      fields: [
        {
          name: "fips_",
          type: "INT",
          is_array: false
        },
        {
          name: "acceptance_date",
          type: "TIMESTAMP",
          is_array: false
        }
      ],
      results: [
        {
          fips_: 51059,
          acceptance_date: "1846-01-06T00:00:00.000Z",
          fips__join: 51059
        },
        {
          fips_: 36089,
          acceptance_date: "1776-08-26T00:00:00.000Z",
          fips__join: 36089
        },
        {
          fips_: 48491,
          acceptance_date: "1801-05-16T00:00:00.000Z",
          fips__join: 48491
        },
        {
          fips_: 48493,
          acceptance_date: "1898-11-09T00:00:00.000Z",
          fips__join: 48493
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LINE })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.VEGA_CHOROPLETH })
    )
  })

  // 1 lat, 1 lon
  test("generates pointmap, bar and scatterplot for 1 lat and 1 lon field", () => {
    const data = {
      query: "select origin_lat, origin_lon from flights_2008_7M LIMIT 5000",
      table: "flights_2008_7M",
      fields: [
        {
          name: "origin_lat",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "origin_lon",
          type: "FLOAT",
          is_array: false
        }
      ],
      results: [
        {
          origin_lat: 40.788387298583984,
          origin_lon: -111.97777557373047
        },
        {
          origin_lat: 33.942535400390625,
          origin_lon: -118.40807342529297
        },
        {
          origin_lat: 40.788387298583984,
          origin_lon: -111.97777557373047
        },
        {
          origin_lat: 32.84711456298828,
          origin_lon: -96.85176849365234
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  // 1 lat, 1 lon, 1 string
  test("generates pointmap, layered bar and scatterplot for 1 lat, 1 lon, and 1 string field", () => {
    const data = {
      query:
        "select origin_lat, origin_lon, plane_manufacturer from flights_2008_7M LIMIT 5000",
      table: "flights_2008_7M",
      fields: [
        {
          name: "origin_lat",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "origin_lon",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "plane_manufacturer",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          origin_lat: 34.200618743896484,
          origin_lon: -118.3584976196289,
          plane_manufacturer: "BOEING"
        },
        {
          origin_lat: 32.84711456298828,
          origin_lon: -96.85176849365234,
          plane_manufacturer: "BOEING"
        },
        {
          origin_lat: 36.080360412597656,
          origin_lon: -115.15233612060547,
          plane_manufacturer: null
        },
        {
          origin_lat: 33.434165954589844,
          origin_lon: -112.008056640625,
          plane_manufacturer: "AIRBUS"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  // 1 lat, 1 lon, 1 numeric
  test("generates pointmap, bar chart, scatterplot and heatmap for 1 lat, 1 lon, and 1 numeric field", () => {
    const data = {
      query:
        "select origin_lat, origin_lon, airtime from flights_2008_7M LIMIT 5000",
      table: "flights_2008_7M",
      fields: [
        {
          name: "origin_lat",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "origin_lon",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "airtime",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          origin_lat: 42.93451690673828,
          origin_lon: -71.43705749511719,
          airtime: 117
        },
        {
          origin_lat: 42.93451690673828,
          origin_lon: -71.43705749511719,
          airtime: 124
        },
        {
          origin_lat: 34.200618743896484,
          origin_lon: -118.3584976196289,
          airtime: null
        },
        {
          origin_lat: 34.200618743896484,
          origin_lon: -118.3584976196289,
          airtime: 56
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 1 lat, 1 lon, 1 string, 1 numeric
  test("generates pointmap, layered bar, scatterplot and heatmap for 1 lat, 1 lon, 1 string and 1 numeric field", () => {
    const data = {
      query:
        "select origin_lat, origin_lon, airtime, plane_model from flights_2008_7M LIMIT 5000",
      table: "flights_2008_7M",
      fields: [
        {
          name: "origin_lat",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "origin_lon",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "airtime",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "plane_model",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          origin_lat: 35.04022216796875,
          origin_lon: -106.60919189453125,
          airtime: 88,
          plane_model: "737-3H4"
        },
        {
          origin_lat: 33.942535400390625,
          origin_lon: -118.40807342529297,
          airtime: 58,
          plane_model: "737-7H4"
        },
        {
          origin_lat: 39.871952056884766,
          origin_lon: -75.24114227294922,
          airtime: 316,
          plane_model: "737-7H4"
        },
        {
          origin_lat: 39.871952056884766,
          origin_lon: -75.24114227294922,
          airtime: 105,
          plane_model: "737-3H4"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(5)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.LAYERED_BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 1 lat, 1 lon, 2 numeric
  test("generates pointmap, bar chart, scatterplot and heatmap for 1 lat, 1 lon, and 2 numeric fields", () => {
    const data = {
      query:
        "select origin_lat, origin_lon, airtime, arrdelay from flights_2008_7M LIMIT 5000",
      table: "flights_2008_7M",
      fields: [
        {
          name: "origin_lat",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "origin_lon",
          type: "FLOAT",
          is_array: false
        },
        {
          name: "airtime",
          type: "SMALLINT",
          is_array: false
        },
        {
          name: "arrdelay",
          type: "SMALLINT",
          is_array: false
        }
      ],
      results: [
        {
          origin_lat: 42.93451690673828,
          origin_lon: -71.43705749511719,
          airtime: 117,
          arrdelay: 21
        },
        {
          origin_lat: 42.93451690673828,
          origin_lon: -71.43705749511719,
          airtime: 124,
          arrdelay: 16
        },
        {
          origin_lat: 34.200618743896484,
          origin_lon: -118.3584976196289,
          airtime: null,
          arrdelay: null
        },
        {
          origin_lat: 34.200618743896484,
          origin_lon: -118.3584976196289,
          airtime: 56,
          arrdelay: 61
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(4)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.HEATMAP })
    )
  })

  // 1 point
  test("generates pointmap for 1 point field", () => {
    const data = {
      query: "select geom from World_Dams",
      table: "World_Dams",
      fields: [
        {
          name: "geom",
          type: "POINT",
          is_array: false
        }
      ],
      results: [
        {
          geom: "POINT (15.8604166451192 48.377083311033)"
        },
        {
          geom: "POINT (101.40874994053 25.2245833190272)"
        },
        {
          geom: "POINT (132.621249972201 34.6454166456337)"
        },
        {
          geom: "POINT (103.601249951684 25.1454166626304)"
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.POINT_MAP)
  })

  // 1 point, 1 string
  test("generates pointmap for 1 point and 1 string field", () => {
    const data = {
      query: "select geom, main_basin from World_Dams",
      table: "World_Dams",
      fields: [
        {
          name: "geom",
          type: "POINT",
          is_array: false
        },
        {
          name: "main_basin",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          geom: "POINT (140.167083283964 37.866249986862)",
          main_basin: "Mogami"
        },
        {
          geom: "POINT (139.907916597979 37.7537499683694)",
          main_basin: "Agano"
        },
        {
          geom: "POINT (29.7837499854079 -19.0504166526023)",
          main_basin: "Zambezi"
        },
        {
          geom: "POINT (132.5137499685 34.5662499892368)",
          main_basin: " "
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.POINT_MAP)
  })

  // 1 point, 1 numeric
  test("generates pointmap for 1 point and 1 numeric field", () => {
    const data = {
      query: "select geom, depth_m from World_Dams",
      table: "World_Dams",
      fields: [
        {
          name: "geom",
          type: "POINT",
          is_array: false
        },
        {
          name: "depth_m",
          type: "DOUBLE",
          is_array: false
        }
      ],
      results: [
        {
          geom: "POINT (133.976249999356 34.1954166554825)",
          depth_m: 32.700001
        },
        {
          geom: "POINT (131.771249972177 34.1745833094113)",
          depth_m: 41.200001
        },
        {
          geom: "POINT (-104.194583252163 41.7162499771063)",
          depth_m: 8.2
        },
        {
          geom: "POINT (131.872916590363 34.0579166468503)",
          depth_m: 49.877
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(1)
    expect(result.charts[0]).toHaveProperty("type", ChartTypes.POINT_MAP)
  })

  // 1 point, 2 numeric
  test("generates pointmap, bar chart and scatterplot for 1 point field and 2 numeric fields", () => {
    const data = {
      query: "select geom, depth_m, cap_max from World_Dams",
      table: "World_Dams",
      fields: [
        {
          name: "geom",
          type: "POINT",
          is_array: false
        },
        {
          name: "depth_m",
          type: "DOUBLE",
          is_array: false
        },
        {
          name: "cap_max",
          type: "DOUBLE",
          is_array: false
        }
      ],
      results: [
        {
          geom: "POINT (136.547083303587 34.4679166443962)",
          depth_m: 12,
          cap_max: -99
        },
        {
          geom: "POINT (14.4879166290573 48.8487499760691)",
          depth_m: 25.8,
          cap_max: -99
        },
        {
          geom: "POINT (-85.0662499782938 31.6287499953195)",
          depth_m: 9.1,
          cap_max: 1152.6
        },
        {
          geom: "POINT (-3.17041665463262 5.6079166362099)",
          depth_m: 11.7,
          cap_max: 1100
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(3)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.SCATTER })
    )
  })

  // 1 point, 1 string, 1 numeric
  test("generates pointmap and bar chart for 1 point, 1 string and 1 numeric field", () => {
    const data = {
      query: "select geom, depth_m, main_basin from World_Dams",
      table: "World_Dams",
      fields: [
        {
          name: "geom",
          type: "POINT",
          is_array: false
        },
        {
          name: "depth_m",
          type: "DOUBLE",
          is_array: false
        },
        {
          name: "main_basin",
          type: "STR",
          is_array: false
        }
      ],
      results: [
        {
          geom: "POINT (-5.58624996132508 9.58708330503995)",
          depth_m: 5.2,
          main_basin: "West Coast"
        },
        {
          geom: "POINT (-1.0220833220622 9.57041664494687)",
          depth_m: 4.5,
          main_basin: "Volta"
        },
        {
          geom: "POINT (73.8254165900058 23.3079166539516)",
          depth_m: 107.8,
          main_basin: "Mahi"
        },
        {
          geom: "POINT (21.9379166243309 41.4020832960504)",
          depth_m: 56.5,
          main_basin: " "
        }
      ]
    }
    const result = generateCharts(data)

    expect(result.charts).toHaveLength(2)
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.POINT_MAP })
    )
    expect(result.charts).toContainEqual(
      expect.objectContaining({ type: ChartTypes.BAR })
    )
  })
})
