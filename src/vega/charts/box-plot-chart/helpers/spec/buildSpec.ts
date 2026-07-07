// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import { SpecOptions } from "vega/charts/combo-chart/row-spec"

import { buildScales } from "./scales"
import { buildSignals } from "./signals"
import { buildAxes } from "./axes"
import { buildMarks } from "./marks"
import { buildData } from "./data"

export const buildSpec = (opts: SpecOptions): Spec => {
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    autosize: { type: "fit", contains: "padding", resize: true },
    padding: 5,
    config: {
      axisBand: {
        bandPosition: 1,
        tickExtra: true
      }
    },
    signals: buildSignals(opts),
    data: buildData(opts),
    scales: buildScales(opts),
    axes: buildAxes(opts),
    marks: buildMarks(opts)
  }
}
