// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  toPostFilterAgg,
  toTransformAgg
} from "../../../../utils/selector-helpers"
import { CHARTS } from "constants/charts"
import { CHART_TYPE_WINDBARB } from "../constants"

export const getWindbarbLayerState = ({
  xValue,
  yValue,
  measures,
  tableSize,
  cap,
  groupby,
  sizeSpec,
  colorSpec,
  colorRamps,
  speedSpec,
  directionSpec,
  currentLayer,
  postFilters
}) => ({
  transform: [
    {
      sample: cap,
      ...(tableSize ? { tableSize } : {})
    },
    {
      limit: CHARTS.windbarb.capMax
    }
  ],
  mark: {
    type: "windbarbs",
    quantizeDirection: false
  },
  encoding: {
    x: {
      type: "quantitative",
      field: `conv_4326_900913_x(${xValue})`,
      ...(groupby.length
        ? { aggregate: toTransformAgg(measures[0].aggType) }
        : {}),
      label: measures[0].label
    },
    y: {
      type: "quantitative",
      field: `conv_4326_900913_y(${yValue})`,
      ...(groupby.length
        ? { aggregate: toTransformAgg(measures[1].aggType) }
        : {}),
      label: measures[1].label
    },
    size: sizeSpec,
    color: colorSpec,
    colorRamps,
    speed: speedSpec,
    direction: directionSpec
  },
  // No hover functionality right now
  enableHitTesting: false,
  currentLayer,
  postFilters:
    postFilters?.map((postFilter) => {
      if (
        postFilter.aggType === "# Unique" ||
        postFilter.aggType === "Median"
      ) {
        return {
          ...postFilter,
          aggType: toPostFilterAgg(postFilter.aggType)
        }
      } else {
        return postFilter
      }
    }) ?? CHARTS[CHART_TYPE_WINDBARB].postFilters
})
