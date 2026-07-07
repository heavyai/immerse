// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Spec } from "vega"
import { SpecOptions } from "vega/charts/combo-chart/row-spec"

// TODO: Define options type
export const buildAxes = (opts: SpecOptions): Spec["axes"] => {
  const axes: Spec["axes"] = []

  axes.push(
    {
      title: { signal: "baseDimensionTitle" },
      orient: "bottom",
      scale: "dimension",
      zindex: 1,
      labelAngle: -45,
      translate: 0,
      labelAlign: "right",
      titleLimit: { signal: "horizontalAxisTitleLength" },
      encode: {
        axis: {
          name: "base-dimension-axis"
        },
        labels: {
          update: {
            text: {
              signal: "formattedDimensions[datum.value]"
            }
          }
        }
      }
    },
    {
      orient: "left",
      scale: "yscale",
      grid: opts?.gridEnabled ?? false,
      title: { signal: "primaryMeasureTitle" },
      encode: {
        axis: {
          name: "primary-measure-axis"
        },
        labels: {
          update: {
            text: {
              signal:
                "autoFormatSpan(datum.value, primaryMeasureDomain, primaryMeasureFormat, datum.label)"
            }
          }
        }
      }
    }
  )

  return axes
}
