// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TimeLagSettings, VegaComboChart } from "vega/charts/types"
import {
  setChartTimeLagDirect,
  clearChartTimeLagDirect,
  linkBaseMeasureToTimeLag,
  unlinkBaseMeasureToTimeLag
} from "./time-lag-settings-action-creators"
import { clearMeasure, setMeasure } from "./data-selection-thunks"
import pushid from "pushid"
import { createMarkSettings, getLayerIndex } from "vega/utils/data-selection"
import {
  setMeasureAxis,
  setMeasureLineStyle,
  setMeasureMarkColor,
  setMeasureMarkType
} from "./mark-settings-action-creators"
import {
  ComboSizeMeasureExpression,
  TIME_LAG_EXPRESSION_TYPE,
  VegaMarkTypes
} from "vega/constants/data-selection-types"

export const createTimeLagMeasureFromBaseMeasure = (
  chartId: string,
  layerId: string,
  baseMeasure: ComboSizeMeasureExpression,
  baseMeasureIndex: number,
  newMeasureIndex: number
) => async (dispatch, getState) => {
  const chartType = getState().charts[chartId].type
  const markType =
    chartType === CHART_TYPES.BOX_PLOT ? VegaMarkTypes.BOX : VegaMarkTypes.BAR
  const defaultMarkSettings = createMarkSettings(markType)
  const copy = { ...baseMeasure }
  delete copy.markSettings
  const timeLagId = pushid()

  dispatch(
    setMeasure(chartId, layerId, "size", newMeasureIndex, {
      id: timeLagId,
      type: TIME_LAG_EXPRESSION_TYPE,
      mode: "actual",
      measure: copy
    })
  )

  if (baseMeasure.markSettings.axis !== defaultMarkSettings.axis) {
    dispatch(
      setMeasureAxis(
        chartId,
        layerId,
        newMeasureIndex,
        baseMeasure.markSettings.axis
      )
    )
  }
  if (baseMeasure.markSettings.markType === "line") {
    dispatch(
      setMeasureMarkColor(
        chartId,
        layerId,
        newMeasureIndex,
        baseMeasure.markSettings.markColor
      )
    )
    dispatch(setMeasureMarkType(chartId, layerId, newMeasureIndex, "line"))
    dispatch(setMeasureLineStyle(chartId, layerId, newMeasureIndex, "dashed"))
  }

  dispatch(
    linkBaseMeasureToTimeLag(chartId, layerId, baseMeasureIndex, timeLagId)
  )
}

export const toggleBaseMeasureTimeLag = (
  chartId: string,
  layerId: string,
  measureIndex: number
) => async (dispatch, getState) => {
  const chart = getState().charts[chartId] as VegaComboChart
  const layerIndex = getLayerIndex(chart.dataSelections, layerId)

  const sizeMeasures = chart.dataSelections[layerIndex].measures.size
  const baseMeasure = sizeMeasures[measureIndex]

  if (baseMeasure.linkedTimeLagId) {
    const timeLagId = baseMeasure.linkedTimeLagId
    dispatch(unlinkBaseMeasureToTimeLag(chartId, layerId, measureIndex))
    const timeLagExprIndex = sizeMeasures.findIndex(
      ({ id }) => id === timeLagId
    )
    if (timeLagExprIndex > -1) {
      dispatch(clearMeasure(chartId, layerId, "size", timeLagExprIndex))
    }
  } else {
    const newMeasureIndex =
      chart.dataSelections[layerIndex].measures.size.length
    dispatch(
      createTimeLagMeasureFromBaseMeasure(
        chartId,
        layerId,
        baseMeasure,
        measureIndex,
        newMeasureIndex
      )
    )
  }
}

export const setChartTimeLag = (
  chartId: string,
  timeLagSettings: TimeLagSettings
) => async (dispatch, getState) => {
  dispatch(setChartTimeLagDirect(chartId, timeLagSettings))
  const chart = getState().charts[chartId] as VegaComboChart

  chart.dataSelections.forEach(({ layerId, measures }) => {
    const { size: sizeMeasures } = measures
    sizeMeasures.forEach((measure, index) => {
      const newMeasureIndex = sizeMeasures.length + index
      dispatch(
        createTimeLagMeasureFromBaseMeasure(
          chartId,
          layerId,
          measure,
          index,
          newMeasureIndex
        )
      )
    })
  })
}

export const clearChartTimeLag = (chartId: string) => async (
  dispatch,
  getState
) => {
  dispatch(clearChartTimeLagDirect(chartId))

  const chart = getState().charts[chartId] as VegaComboChart

  chart.dataSelections.forEach(({ layerId, measures }) => {
    const { size: sizeMeasures } = measures
    const indicesToRemove = sizeMeasures.map(({ type }, index) =>
      type === TIME_LAG_EXPRESSION_TYPE ? index : null
    )
    // we reverse such that the index of time_lag measures isn't displaced upon each removal
    indicesToRemove.reverse().forEach((measureIndex) => {
      if (measureIndex !== null) {
        dispatch(clearMeasure(chartId, layerId, "size", measureIndex))
      }
    })
  })
}
