// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { connect, ConnectedProps } from "react-redux"

import { AppState } from "vega/charts/types"
import { Dispatch } from "redux"
import { sumOptionsEnabled } from "components/chart-settings/vega-combo/utils"
import {
  ComboDataSelection,
  MarkSettings
} from "vega/constants/data-selection-types"
import VegaChartFormatting from "vega/components/ChartFormatting/VegaChartFormatting"

import { setBaseDimensionFormat } from "vega/actions/bin-settings-action-creators"
import {
  setPrimaryMeasureFormat,
  setSecondaryMeasureFormat
} from "vega/actions/presentation-settings-action-creators"

interface OwnProps {
  chartId: string
}

const shouldShowAxis = (
  dataSelections: ComboDataSelection[],
  axis: MarkSettings["axis"]
) =>
  Boolean(
    dataSelections.flatMap(({ measures: { size } }) =>
      size.filter((measure) => measure.markSettings.axis === axis)
    ).length
  )

const mapStateToProps = (state: AppState, { chartId }: OwnProps) => {
  const chart = state.charts[chartId]
  const { dataSelections } = chart

  const { sizeMeasurePrimaryAxis } = chart.presentation
  const { sizeMeasureSecondaryAxis } = chart.presentation

  const lockPrimaryAxisToPercentage =
    sumOptionsEnabled(chart, "primary") &&
    sizeMeasurePrimaryAxis.percentageDistributionEnabled

  const lockSecondaryAxisToPercentage =
    sumOptionsEnabled(chart, "secondary") &&
    sizeMeasureSecondaryAxis.percentageDistributionEnabled

  // If a user creates a chart layer that has multiple base dimensions, they've
  // actually created a chart with a categorical "hybrid" base dimension. We are
  // going to disallow custom formats in this case
  const chartHasLayerWithMultipleBaseDimensions = dataSelections.some(
    (ds) => ds.dimensions.xAxis.length > 1
  )

  // Also disallow formatting if the base dimension is an extract
  const enableBaseDimensionFormatDropdown =
    !(chart.binSettings?.dimensionType === "extract_time") &&
    !chartHasLayerWithMultipleBaseDimensions

  const baseDimensionFormat = chart.binSettings?.format

  return {
    baseDimension: {
      enableFormatDropdown: enableBaseDimensionFormatDropdown,
      columnType:
        chart.dataSelections.length > 0 &&
        chart.dataSelections[0].dimensions.xAxis.length === 1 &&
        chart.dataSelections[0].dimensions.xAxis[0].column &&
        chart.dataSelections[0].dimensions.xAxis[0].column.type,
      format: baseDimensionFormat
    },
    primaryAxis: {
      enabled: shouldShowAxis(dataSelections, "primary"),
      lockToPercentage: lockPrimaryAxisToPercentage,
      format: sizeMeasurePrimaryAxis.format
    },
    secondaryAxis: {
      enabled: shouldShowAxis(dataSelections, "secondary"),
      lockToPercentage: lockSecondaryAxisToPercentage,
      format: sizeMeasureSecondaryAxis.format
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => {
  return {
    actions: {
      setBaseDimensionFormat(baseDimensionFormat: string) {
        dispatch(setBaseDimensionFormat(chartId, baseDimensionFormat))
      },
      setPrimaryAxisFormat(format: string) {
        dispatch(setPrimaryMeasureFormat(chartId, format))
      },
      setSecondaryAxisFormat(format: string) {
        dispatch(setSecondaryMeasureFormat(chartId, format))
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const FormattingSettings: FC<Props> = ({
  baseDimension,
  primaryAxis,
  secondaryAxis,
  actions
}) => {
  const baseDimensionTooltip = !baseDimension.enableFormatDropdown
    ? "Formatting not supported for extracts or multiple base dimensions"
    : ""
  return (
    <>
      <div className="input-row">
        <VegaChartFormatting
          baseDimensionType={baseDimension.columnType}
          baseDimensionFormat={baseDimension.format}
          onDimensionFormat={actions.setBaseDimensionFormat}
          axisLabel={"Base dimension format"}
          disabled={!baseDimension.enableFormatDropdown}
          tooltip={baseDimensionTooltip}
        />
      </div>
      {primaryAxis.enabled && (
        <div className="input-row">
          <VegaChartFormatting
            sizeMeasureFormat={primaryAxis.format}
            onMeasureNumberFormat={actions.setPrimaryAxisFormat}
            axisLabel={`Primary axis format`}
            lockToPercentage={primaryAxis.lockToPercentage}
          />
        </div>
      )}
      {secondaryAxis.enabled && (
        <div className="input-row">
          <VegaChartFormatting
            sizeMeasureFormat={secondaryAxis.format}
            onMeasureNumberFormat={actions.setSecondaryAxisFormat}
            axisLabel={`Secondary axis format`}
            lockToPercentage={secondaryAxis.lockToPercentage}
          />
        </div>
      )}
    </>
  )
}

export default connector(FormattingSettings)
