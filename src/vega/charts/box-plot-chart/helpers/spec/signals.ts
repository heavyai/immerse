// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import { SpecOptions } from "vega/charts/combo-chart/row-spec"

export const buildSignals = (_: SpecOptions): Spec["signals"] => {
  const signals: Spec["signals"] = [
    { name: "plotWidth", value: 60 },
    { name: "boxWidth", value: 15 },
    { name: "violinWidth", value: 40 },
    {
      name: "tooltip",
      description: "On hover, the data under the cursor.",
      value: null
    },
    {
      name: "dimensionDomain",
      description: "Domain for the base dimension on the primary axis.",
      value: []
    },
    {
      name: "primaryMeasureDomain",
      description: "Domain for the measure scale on the primary axis.",
      value: [0, 0]
    },
    {
      name: "computedMeasureDomain",
      description:
        "The full computed domain of the measure, filters included but not bounded by manual min/max",
      value: [0, 0]
    },
    {
      name: "maxDimensionTicks",
      description: "Maximum number of ticks on the dimension axis.",
      update: "length(dimensionDomain)"
    },
    {
      name: "minBandwidth",
      description: "Minimum bandwidth for dimension scale.",
      value: 40
      // update:
      //   // TODO: boxPlotSettings was barSettings - Figure out what's happening with this is combo chart and copy in box plot chart
      //   "40"
    },
    {
      name: "scrollPercent",
      description: "The scrolling position as a value between 0 and 1.",
      value: 0,
      on: [
        {
          events: "wheel![!event.ctrlKey && !event.altKey]",
          update:
            "clamp(scrollPercent + (event.deltaX * pow(16, event.deltaMode)) / width, 0, 1)"
        }
      ]
    },
    {
      name: "dimensionAxisTickOffset",
      description: "Tick offset on the dimension axis.",
      update: "0"
    },
    {
      name: "formattedDimensions",
      value: {}
    },
    {
      name: "baseDimensionTitle",
      description: "Title for the base dimension axis",
      value: null
    },
    {
      name: "primaryMeasureTitle",
      description: "Title for the primary measure axis",
      value: ""
    },
    {
      name: "baseDimensionLabelLimit",
      description: "Length limit for labels in pixels.",
      value: 100
    },
    {
      name: "verticalAxisTitleLength",
      update: "height - 50"
    },
    {
      name: "horizontalAxisTitleLength",
      update: "width - 50"
    },
    {
      name: "primaryMeasureFormat",
      value: null
    },
    {
      name: "selectedValues",
      description: "Selected bars/violins from crossfilter click",
      value: []
    },
    {
      name: "negativeSelectedValues",
      description:
        "Values that *aren't* selected if a negative selection was made",
      value: []
    },
    {
      name: "filter",
      description: "When a user clicks on a box plot or violin plot element",
      value: null,
      on: [
        {
          events:
            "@violinArea:click![!event.ctrlKey][!event.metaKey], @boxPlotArea:click![!event.ctrlKey][!event.metaKey]",
          update: "{ value: datum.dimension }",
          force: true
        },
        {
          events:
            "@violinArea:click![event.ctrlKey], @violinArea:click![event.metaKey], @boxPlotArea:click![event.ctrlKey], @boxPlotArea:click![event.metaKey]",
          update: "{ value: datum.dimension, negated: true }",
          force: true
        }
      ]
    },
    {
      name: "clearFilters",
      description: "Signal fires on double click to clear all filters",
      value: null,
      on: [
        {
          events: "@chart:dblclick!",
          update: "true",
          force: true
        }
      ]
    },
    {
      name: "bandPos",
      update:
        "{ left: 0 - bandwidth('dimension') * 0.125, center: bandwidth('dimension') * 0.5, right: bandwidth('dimension') * 1.125 }"
    }
  ]

  return signals
}
