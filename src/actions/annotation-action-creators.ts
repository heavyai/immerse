// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dispatch } from "redux"
import pushid from "pushid"
import {
  Annotation,
  RESET_ANNOTATIONS,
  TOGGLE_ANNOTATIONS,
  TOGGLE_ANNOTATIONS_EDIT_MODE,
  ADD_ANNOTATION,
  COPY_CHART_ANNOTATION,
  EDIT_ANNOTATION,
  TOGGLE_ANNOTATION,
  TOGGLE_CHART_ANNOTATION,
  POSITION_ANNOTATION,
  RESIZE_ANNOTATION,
  DELETE_ANNOTATION,
  DELETE_ANNOTATIONS_FOR_CHART
} from "constants/annotations"
import { updateDashboardSaveState } from "./dashboard-save-state-action-creators"

/**
 * Reset annotations back to default state
 */
export const resetAnnotations = () => ({
  type: RESET_ANNOTATIONS
})

/**
 * Globally toggle annotations on or off.
 * @param enabled If set, explicitly enable/disable annotations. Otherwise,
 *   toggle.
 */
export const toggleAnnotations = (enabled?: boolean) => ({
  type: TOGGLE_ANNOTATIONS,
  enabled
})

/**
 * Toggle annotations edit mode.
 * @param editMode If set, explicitly enable/disable edit mode. Otherwise,
 * toggle.
 */
export const toggleAnnotationsEditMode = (editMode?: boolean) => ({
  type: TOGGLE_ANNOTATIONS_EDIT_MODE,
  editMode
})

/**
 * Add an annotation.
 * @param annotation The annotation to add.
 * @returns The id of the newly created annotation.
 */
export const addAnnotation = (annotation: Annotation) => (
  dispatch: Dispatch
) => {
  const newAnnotationId = pushid()

  dispatch({
    type: ADD_ANNOTATION,
    annotation,
    newAnnotationId
  })

  dispatch(updateDashboardSaveState(true))

  return newAnnotationId
}

/**
 * Copy chart-specific annotation settings
 * @param chartId Chart to copy from.
 * @param newChartId Chart to copy to.
 * @param annotationId Original annotation id.
 * @param newAnnotationId New annotation id.
 */
export const copyChartAnnotation = (
  chartId: string,
  newChartId: string,
  annotationId: string,
  newAnnotationId: string
) => ({
  type: COPY_CHART_ANNOTATION,
  chartId,
  newChartId,
  annotationId,
  newAnnotationId
})

/**
 * Copy annotations from one chart to another.
 * @param chartId Chart to copy from.
 * @param newChartId Chart to copy to.
 */
export const copyAnnotations = (chartId: string, newChartId: string) => (
  dispatch: Dispatch,
  getState: () => any
) => {
  const {
    annotations: { annotations }
  } = getState()

  Object.keys(annotations).forEach((annotationId) => {
    if (annotations[annotationId].chartId === chartId) {
      const annotationCopy = {
        ...annotations[annotationId],
        chartId: String(newChartId)
      }

      const newAnnotationId = dispatch(addAnnotation(annotationCopy))

      dispatch(
        copyChartAnnotation(chartId, newChartId, annotationId, newAnnotationId)
      )
    }
  })

  dispatch(updateDashboardSaveState(true))
}

/**
 * Update an annotation
 * @param id The id of the annotation to update.
 * @param annotation The fields with their new values to update.
 */
export const editAnnotation = (id: string, annotation: Partial<Annotation>) => (
  dispatch: Dispatch
) => {
  dispatch({
    type: EDIT_ANNOTATION,
    id,
    annotation
  })

  dispatch(updateDashboardSaveState(true))
}

/**
 * Toggle an annotation
 * @param id The id of the annotation to toggle.
 * @param hidden If set, explicitly hide/unhide the annotation. Otherwise,
 *   toggle the state.
 */
export const toggleAnnotation = (id: string, hidden?: boolean) => ({
  type: TOGGLE_ANNOTATION,
  id,
  hidden
})

/**
 * Toggle an annotation for a specific chart.
 * @param chartId The chart ID.
 * @param annotationId The id of the annotation to toggle.
 * @param hidden If set, explicitly hide/unhide the annotation. Otherwise,
 *   toggle the state.
 */
export const toggleChartAnnotation = (
  chartId: string,
  annotationId: string,
  hidden?: boolean
) => ({
  type: TOGGLE_CHART_ANNOTATION,
  chartId,
  annotationId,
  hidden
})

/**
 * Manually position an annotation on a chart.
 * @param chartId The chart ID.
 * @param annotationId The id of the annotation to position.
 * @param xOffset Pixel offset of the annotation, relative to the anchor.
 * @param yOffset Pixel offset of the annotation, relative to the anchor.
 */
export const positionAnnotation = (
  chartId: string,
  annotationId: string,
  xOffset: number,
  yOffset: number
) => ({
  type: POSITION_ANNOTATION,
  chartId,
  annotationId,
  xOffset,
  yOffset
})

/**
 * Manually resize an annotation on a chart.
 * @param chartId The chart ID.
 * @param annotationId The id of the annotation to resize.
 * @param width New width in pixels.
 * @param height New height in pixels.
 */
export const resizeAnnotation = (
  chartId: string,
  annotationId: string,
  width: number,
  height: number
) => ({
  type: RESIZE_ANNOTATION,
  chartId,
  annotationId,
  width,
  height
})

/**
 * Remove an annotation.
 * @param id The id of the annotation to remove.
 */
export const deleteAnnotation = (id: string) => (dispatch: Dispatch) => {
  dispatch({
    type: DELETE_ANNOTATION,
    id
  })
  dispatch(updateDashboardSaveState(true))
}

/**
 * Remove annotations for a chart.
 * @param chartId The chart id.
 */
export const deleteAnnotationsForChart = (chartId: string) => ({
  type: DELETE_ANNOTATIONS_FOR_CHART,
  chartId
})
