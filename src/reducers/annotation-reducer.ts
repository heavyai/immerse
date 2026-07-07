// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { cloneDeep } from "lodash"

import createReducer from "utils/redux/create-reducer"
import {
  AnnotationState,
  RESET_ANNOTATIONS,
  TOGGLE_ANNOTATIONS,
  TOGGLE_ANNOTATIONS_EDIT_MODE,
  ADD_ANNOTATION,
  EDIT_ANNOTATION,
  TOGGLE_ANNOTATION,
  DELETE_ANNOTATION,
  DELETE_ANNOTATIONS_FOR_CHART
} from "constants/annotations"
import * as actions from "actions/annotation-action-creators"

const initialState: AnnotationState = {
  annotations: {},
  enabled: true,
  editMode: false
}

const reducer = {
  [RESET_ANNOTATIONS]() {
    return initialState
  },

  [TOGGLE_ANNOTATIONS](
    state: AnnotationState,
    { enabled }: ReturnType<typeof actions.toggleAnnotations>
  ) {
    state = state || initialState
    if (enabled === undefined) {
      enabled = !state.enabled
    }
    return {
      ...state,
      enabled
    }
  },

  [TOGGLE_ANNOTATIONS_EDIT_MODE](
    state: AnnotationState,
    { editMode }: ReturnType<typeof actions.toggleAnnotationsEditMode>
  ) {
    state = state || initialState
    if (editMode === undefined) {
      editMode = !state.editMode
    }
    return {
      ...state,
      editMode
    }
  },

  [ADD_ANNOTATION](
    state: AnnotationState,
    { annotation, newAnnotationId }: ReturnType<typeof actions.addAnnotation>
  ) {
    state = state || initialState
    return {
      ...state,
      annotations: {
        ...state.annotations,
        [newAnnotationId]: cloneDeep(annotation)
      }
    }
  },

  [EDIT_ANNOTATION](
    state: AnnotationState,
    { id, annotation }: ReturnType<typeof actions.editAnnotation>
  ) {
    state = state || initialState
    if (id in state.annotations) {
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [id]: {
            ...state.annotations[id],
            ...cloneDeep(annotation)
          }
        }
      }
    }
    return state
  },

  [TOGGLE_ANNOTATION](
    state: AnnotationState,
    { id, hidden }: ReturnType<typeof actions.toggleAnnotation>
  ) {
    state = state || initialState
    if (id in state.annotations) {
      if (hidden === undefined) {
        hidden = !state.annotations[id].hidden
      }
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [id]: {
            ...state.annotations[id],
            hidden
          }
        }
      }
    }
    return state
  },

  [DELETE_ANNOTATION](
    state: AnnotationState,
    { id }: ReturnType<typeof actions.deleteAnnotation>
  ) {
    state = state || initialState
    const { [id]: _, ...annotations } = state.annotations
    return {
      ...state,
      annotations
    }
  },

  [DELETE_ANNOTATIONS_FOR_CHART](
    state: AnnotationState,
    { chartId }: ReturnType<typeof actions.deleteAnnotationsForChart>
  ) {
    state = state || initialState
    const annotations = { ...state.annotations }

    Object.entries(annotations).forEach(
      ([annotationKey, annotationProperties]) => {
        // When we start allowing annotations to show on multiple charts, we'll
        // want to either pop the chartId from a list, or if it's the last one,
        // delete the annotation completely
        if (annotationProperties.chartId === chartId) {
          delete annotations[annotationKey]
        }
      }
    )

    return {
      ...state,
      annotations
    }
  }
}

export default createReducer(reducer, initialState)
