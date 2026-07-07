// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FormEvent } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Switch } from "widgets/switch/Switch"

import {
  setOutliersEnabled,
  setGridEnabled
} from "vega/actions/data-selection-action-creators"
import { setOrientation } from "vega/actions/presentation-settings-action-creators"
import { AppState } from "vega/charts/types"

import ChartOrientationInput from "components/chart-settings/vega-combo/components/inputs/chart-orientation-input"
import { VegaComboPresentationSettings } from "vega/constants/presentation-settings-types"
import { isGridEnabled } from "vega/utils/presentation"

export const FeaturedSettings = ({ chartId }: { chartId: string }) => {
  const dispatch = useDispatch()

  const { orientation, outliersEnabled, gridEnabled } = useSelector(
    (state: AppState) => {
      const chart = state.charts[chartId]
      return {
        orientation: chart.presentation.orientation,
        outliersEnabled: chart.outliersEnabled,
        gridEnabled: isGridEnabled(chart)
      }
    }
  )

  const actions = {
    setOrientation: (direction: VegaComboPresentationSettings["orientation"]) =>
      dispatch(setOrientation(chartId, direction)),
    setOutliersEnabled: (enabled: boolean) =>
      dispatch(setOutliersEnabled(chartId, enabled)),
    setGridEnabled: (enabled: boolean) =>
      dispatch(setGridEnabled(chartId, enabled))
  }

  return (
    <>
      <ChartOrientationInput
        selected={orientation}
        setChartOrientation={actions.setOrientation}
      />
      <div className="switch-with-label">
        <div>Show outliers</div>
        <Switch
          checked={outliersEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) => {
            actions.setOutliersEnabled(event.currentTarget.checked)
          }}
        />
      </div>
      <div className="switch-with-label">
        <div>Show grid lines</div>
        <Switch
          checked={gridEnabled}
          onChange={(event: FormEvent<HTMLInputElement>) => {
            actions.setGridEnabled(event.currentTarget.checked)
          }}
        />
      </div>
    </>
  )
}
