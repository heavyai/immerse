// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { topNLegendSort } from "vega/charts/top-n-utils"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { TooltipData, TooltipMeasure } from "./ChartTooltip"

import "./ComboTooltip.scss"

export interface ComboTooltip {
  data: TooltipData["data"]
  invertOrder: boolean
}

export const ComboTooltip: FC<ComboTooltip> = ({ data, invertOrder }) => {
  const layers = [...(data.measures || [])].reduce<TooltipMeasure[][]>(
    (accum, m) => {
      if (typeof accum[m.dataSelectionIndex] === "undefined") {
        accum[m.dataSelectionIndex] = [m]
      } else {
        accum[m.dataSelectionIndex].push(m)
      }
      return accum
    },
    []
  )
  return (
    <>
      <div className="chart-tooltip__dimension">{data.dimension}</div>
      {layers.map((measures, index) => (
        <div className="chart-tooltip__layer" key={index}>
          <p>
            Layer {index + 1} - {measures[0].dataSource}
          </p>
          {measures.sort(topNLegendSort(invertOrder)).map((measure) => (
            <div
              className="chart-tooltip__measure"
              key={`measure-${measure.order}`}
            >
              <i
                className="chart-tooltip__measure__swatch"
                style={{ backgroundColor: measure.color }}
              />
              <div className="chart-tooltip__measure__value_container">
                {measure.colorMeasureAggregate && (
                  <span className="chart-tooltip__measure__color_value">
                    <strong>{measure.colorMeasureAggregate}</strong>:{" "}
                    {measure.colorMeasureValue}
                  </span>
                )}
                <span className="chart-tooltip__measure__value">
                  <strong>
                    {process(measure.label, { useDisplayName: true })}
                  </strong>
                  : {measure.value}
                  {measure.value !== measure.rawValue && (
                    <>&nbsp;({measure.rawValue})</>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
