// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, FormEvent } from "react"
import { connect, ConnectedProps } from "react-redux"

import { AppState } from "vega/charts/types"
import { Dispatch } from "redux"
import { sumOptionsEnabled } from "components/chart-settings/vega-combo/utils"

import { Switch } from "widgets/switch/Switch"
import NumericalSlider from "vega/components/NumericalSlider"
import {
  setNumberOfGroups,
  setNullDimensionsEnabled,
  setConnectNullsAcrossGaps
} from "vega/actions/data-selection-action-creators"
import PdfCdf from "components/chart-settings/vega-combo/components/data-formatting-components/pdf-cdf"
import BaseDimensionSort from "vega/components/BaseDimensionSort"
import { VegaMarkTypes } from "vega/constants/data-selection-types"

interface OwnProps {
  chartId: string
}

const mapStateToProps = (state: AppState, { chartId }: OwnProps) => {
  const chart = state.charts[chartId]

  const showNumberOfGroupsSlider = !chart.binSettings
  const numberOfGroups = chart.numberOfGroups

  const showNullDimensionsToggle = !(
    chart.binSettings?.dimensionType === "binned_numeric" ||
    chart.binSettings?.dimensionType === "binned_time"
  )
  const showingNullDimensions = chart.showNullDimensions

  const hasLineOrAreaMeasure = chart.dataSelections.some((selection) =>
    selection.measures.size.some(
      (measure) => measure?.markSettings?.markType === VegaMarkTypes.LINE
    )
  )
  const connectNullsAcrossGaps = Boolean(chart.connectNullsAcrossGaps)

  return {
    showNumberOfGroupsSlider,
    numberOfGroups,
    showingNullDimensions,
    showNullDimensionsToggle,
    hasLineOrAreaMeasure,
    connectNullsAcrossGaps,
    primaryAxis: {
      sumOptionsEnabled: sumOptionsEnabled(chart, "primary")
    },
    secondaryAxis: {
      sumOptionsEnabled: sumOptionsEnabled(chart, "secondary")
    }
  }
}

const mapDispatchToProps = (dispatch: Dispatch, { chartId }: OwnProps) => {
  return {
    actions: {
      setNumberOfGroups(numberOfGroups: number) {
        dispatch(setNumberOfGroups(chartId, numberOfGroups))
      },
      setNullDimensionsEnabled(enabled: boolean) {
        dispatch(setNullDimensionsEnabled(chartId, enabled))
      },
      setConnectNullsAcrossGaps(enabled: boolean) {
        dispatch(setConnectNullsAcrossGaps(chartId, enabled))
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

const DataSettings: FC<Props> = ({
  chartId,
  showNumberOfGroupsSlider,
  numberOfGroups,
  showingNullDimensions,
  showNullDimensionsToggle,
  hasLineOrAreaMeasure,
  connectNullsAcrossGaps,
  primaryAxis,
  secondaryAxis,
  actions
}) => {
  return (
    <>
      <div className="select-with-sort">
        <BaseDimensionSort chartId={chartId} />
      </div>
      {showNumberOfGroupsSlider && (
        <NumericalSlider
          label="# of Groups"
          max={500}
          min={1}
          step={1}
          value={numberOfGroups}
          onChange={actions.setNumberOfGroups}
        />
      )}
      {showNullDimensionsToggle && (
        <div className="switch-with-label">
          <div>Include null values</div>
          <Switch
            checked={showingNullDimensions}
            onChange={(event: FormEvent<HTMLInputElement>) =>
              actions.setNullDimensionsEnabled(event.currentTarget.checked)
            }
          />
        </div>
      )}
      {hasLineOrAreaMeasure && (
        <div className="switch-with-label">
          <div>Connect lines across gaps</div>
          <Switch
            className="compact"
            checked={connectNullsAcrossGaps}
            onChange={(event: FormEvent<HTMLInputElement>) =>
              actions.setConnectNullsAcrossGaps(event.currentTarget.checked)
            }
          />
        </div>
      )}
      {primaryAxis.sumOptionsEnabled && (
        <PdfCdf chartId={chartId} axis="primary" />
      )}
      {secondaryAxis.sumOptionsEnabled && (
        <PdfCdf chartId={chartId} axis="secondary" />
      )}
    </>
  )
}

export default connector(DataSettings)
