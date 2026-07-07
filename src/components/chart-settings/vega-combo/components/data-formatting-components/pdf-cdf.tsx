// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, FormEvent } from "react"
import { connect, ConnectedProps } from "react-redux"
import { Switch } from "widgets/switch/Switch"

import { MarkSettings } from "vega/constants/data-selection-types"

import { AppState } from "vega/charts/types"
import { AnyAction } from "redux"
import { ThunkDispatch } from "redux-thunk"
import {
  setPrimaryCumulativeDistributionEnabled,
  setSecondaryCumulativeDistributionEnabled,
  setPrimaryPercentageDistributionEnabled,
  setSecondaryPercentageDistributionEnabled
} from "vega/actions/presentation-settings-action-creators"

interface OwnProps {
  chartId: string
  axis: MarkSettings["axis"]
}

const mapStateToProps = (state: AppState, { chartId, axis }: OwnProps) => {
  const chart = state.charts[chartId]
  const sizeMeasurePresentationSettings =
    axis === "primary"
      ? chart.presentation.sizeMeasurePrimaryAxis
      : chart.presentation.sizeMeasureSecondaryAxis
  const {
    cumulativeDistributionEnabled,
    percentageDistributionEnabled
  } = sizeMeasurePresentationSettings
  return {
    cumulativeDistributionEnabled,
    percentageDistributionEnabled
  }
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, {}, AnyAction>,
  { chartId, axis }: OwnProps
) => {
  const setCumulativeEnabled =
    axis === "primary"
      ? setPrimaryCumulativeDistributionEnabled
      : setSecondaryCumulativeDistributionEnabled
  const setPercentageEnabled =
    axis === "primary"
      ? setPrimaryPercentageDistributionEnabled
      : setSecondaryPercentageDistributionEnabled
  return {
    actions: {
      setCumulativeDistributionEnabled(enabled: boolean) {
        dispatch(setCumulativeEnabled(chartId, enabled))
      },
      setPercentageDistributionEnabled(enabled: boolean) {
        dispatch(setPercentageEnabled(chartId, enabled))
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

const PdfCdf: FC<Props> = ({
  axis,
  cumulativeDistributionEnabled,
  percentageDistributionEnabled,
  actions
}) => {
  const axisLabel = axis === "primary" ? "Primary" : "Secondary"
  return (
    <div className="pdfcdf-section">
      <div className="settings-subheader">{axisLabel} axis</div>
      <div className="switch-with-label">
        <div>Show as cumulative</div>
        <Switch
          className="compact"
          checked={cumulativeDistributionEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) =>
            actions.setCumulativeDistributionEnabled(
              event.currentTarget.checked
            )
          }
        />
      </div>
      <div className="switch-with-label">
        <div>Show as percentages</div>
        <Switch
          className="compact"
          checked={percentageDistributionEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) =>
            actions.setPercentageDistributionEnabled(
              event.currentTarget.checked
            )
          }
        />
      </div>
    </div>
  )
}

export default connector(PdfCdf)
