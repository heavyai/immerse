// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import { SpecOptions } from "vega/charts/combo-chart/row-spec"

export const buildData = (_: SpecOptions): Spec["data"] => {
  const data: Spec["data"] = [
    {
      name: "boxPlotTable"
    },
    {
      name: "violinPlotTable"
    },
    {
      name: "outliersTable"
    },
    // statistics data field
    {
      name: "stats",
      source: "boxPlotTable",
      transform: [
        {
          type: "formula",
          as: "iqr",
          expr: "datum.measure0_q3 - datum.measure0_q1"
        },
        {
          type: "formula",
          as: "iqr15",
          expr: "datum.iqr * 1.5"
        },
        {
          type: "formula",
          as: "measure0_q1_min",
          expr: "datum.measure0_q1 - datum.iqr15"
        },
        {
          type: "formula",
          as: "measure0_q3_max",
          expr: "datum.measure0_q3 + datum.iqr15"
        },
        {
          type: "formula",
          as: "lowerWhisker",
          expr: "max(datum.measure0_q1_min, datum.measure0_min)"
        },
        {
          type: "formula",
          as: "upperWhisker",
          expr: "min(datum.measure0_q3_max, datum.measure0_max)"
        },
        {
          type: "formula",
          as: "measure0_min_min",
          expr: "min(datum.measure0_min)"
        },
        {
          type: "formula",
          as: "measure0_max_max",
          expr: "max(datum.measure0_max)"
        }
      ]
    },
    {
      name: "tooltipTable",
      values: []
    }
  ]

  return data
}
