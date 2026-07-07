// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import MarkStyleIcon from "components/chart-legend/mark-style-icon"

import {
  ComboSizeMeasureExpression,
  MeasureExpression
} from "vega/constants/data-selection-types"

import { getMeasureLabel } from "vega/utils/data-selection"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { useSelector } from "react-redux"

type OwnProps = {
  measures: {
    size: ComboSizeMeasureExpression[]
    color: MeasureExpression | null
  }
  dataUi: string
  chartId: string
}

const MeasuresLayerLegend: FC<OwnProps> = ({ measures, dataUi, chartId }) => {
  const timeLagSettings = useSelector(
    ({ charts }) => charts[chartId].timeLagSettings
  )

  return (
    <React.Fragment>
      {measures.size.map((measure, index) => (
        <div
          className="measure-item-container"
          key={`${measure.table}-${measure.type}-${index}`}
        >
          <div className="measure-item">
            <MarkStyleIcon
              style={measure.markSettings.lineStyle.replace("dashed", "dashes")}
              value={measure.markSettings.markColor}
              chartType={measure.markSettings.markType}
            />
            <div className="measure-value" data-ui-config-id={dataUi}>
              <span>
                {process(getMeasureLabel(measure, timeLagSettings), {
                  useDisplayName: true
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </React.Fragment>
  )
}

export default MeasuresLayerLegend
