// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import { SpecOptions } from "vega/charts/combo-chart/row-spec"

export const buildScales = (_: SpecOptions): Spec["scales"] => {
  const scales: Spec["scales"] = [
    {
      name: "layout",
      type: "band",
      range: "width",
      domain: { signal: "dimensionDomain" }
    },
    {
      name: "yscale",
      type: "linear",
      domain: { signal: "primaryMeasureDomain" },
      range: "height",
      zero: false
    },
    {
      name: "color",
      type: "ordinal",
      domain: { signal: "dimensionDomain" },
      range: "category"
    },
    {
      name: "dimension",
      type: "scrollingband",
      domain: {
        signal: "dimensionDomain"
      },
      range: "width",
      minBandwidth: {
        signal: "minBandwidth"
      },
      scrollPercent: {
        signal: "scrollPercent"
      },
      zoomTo: null,
      binnedScaleType: "linear",
      maxTicks: {
        signal: "maxDimensionTicks"
      },
      paddingInner: 0.2,
      paddingOuter: 0.1
    }
  ]

  return scales
}
