// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  COPY_CHART_ANNOTATION,
  DELETE_ANNOTATION,
  TOGGLE_CHART_ANNOTATION,
  POSITION_ANNOTATION,
  RESIZE_ANNOTATION
} from "constants/annotations"
import { cloneDeep } from "lodash"
import * as actions from "actions/annotation-action-creators"
import { Chart } from "vega/charts/types"

type State = Record<string, Chart>

export default {
  [TOGGLE_CHART_ANNOTATION](
    state: State,
    {
      chartId,
      annotationId,
      hidden
    }: ReturnType<typeof actions.toggleChartAnnotation>
  ): State {
    const chart = state[chartId] || {}
    const annotations = chart.annotations || {}
    if (hidden === undefined) {
      hidden = !annotations[annotationId]?.hidden
    }
    return {
      ...state,
      [chartId]: {
        ...chart,
        annotations: {
          ...annotations,
          [annotationId]: {
            ...annotations[annotationId],
            hidden
          }
        }
      }
    }
  },

  [COPY_CHART_ANNOTATION](
    state: State,
    {
      chartId,
      newChartId,
      annotationId,
      newAnnotationId
    }: ReturnType<typeof actions.copyChartAnnotation>
  ): State {
    const { [chartId]: chart, [newChartId]: newChart } = state
    const newChartAnnotations = newChart.annotations || {}

    if (chart.annotations && chart.annotations[annotationId]) {
      return {
        ...state,
        [newChartId]: {
          ...newChart,
          annotations: {
            ...newChartAnnotations,
            [newAnnotationId]: cloneDeep(chart.annotations[annotationId])
          }
        }
      }
    }

    return state
  },

  [POSITION_ANNOTATION](
    state: State,
    {
      chartId,
      annotationId,
      xOffset,
      yOffset
    }: ReturnType<typeof actions.positionAnnotation>
  ): State {
    const chart = state[chartId] || {}
    const annotations = chart.annotations || {}
    return {
      ...state,
      [chartId]: {
        ...chart,
        annotations: {
          ...annotations,
          [annotationId]: {
            ...annotations[annotationId],
            xOffset,
            yOffset
          }
        }
      }
    }
  },

  [RESIZE_ANNOTATION](
    state: State,
    {
      chartId,
      annotationId,
      width,
      height
    }: ReturnType<typeof actions.resizeAnnotation>
  ): State {
    const chart = state[chartId] || {}
    const annotations = chart.annotations || {}
    return {
      ...state,
      [chartId]: {
        ...chart,
        annotations: {
          ...annotations,
          [annotationId]: {
            ...annotations[annotationId],
            width,
            height
          }
        }
      }
    }
  },

  [DELETE_ANNOTATION](
    state: State,
    { id }: ReturnType<typeof actions.deleteAnnotation>
  ): State {
    const chartsWithoutAnnotation = Object.keys(state).reduce(
      (newState, chartId) => {
        const chart = state[chartId] || {}

        if (chart.annotations) {
          const { [id]: _, ...annotations } = chart.annotations

          newState[chartId] = {
            ...chart,
            annotations
          }
        }

        return newState
      },
      {}
    )

    return {
      ...state,
      ...chartsWithoutAnnotation
    }
  }
}
