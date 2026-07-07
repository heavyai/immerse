// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CHART_REDRAW_ERROR,
  CHART_REDRAW_REQUEST,
  CHART_REDRAW_SUCCESS,
  CHART_RENDER_ERROR,
  CHART_RENDER_REQUEST,
  CHART_RENDER_SUCCESS,
  INITIAL_RENDER_BEGIN,
  INITIAL_RENDER_DONE,
  INITIAL_RENDER_ERROR,
  REDRAW_ALL_ERROR,
  REDRAW_ALL_REQUEST,
  REDRAW_ALL_SUCCESS,
  RENDER_ALL_ERROR,
  RENDER_ALL_REQUEST,
  RENDER_ALL_SUCCESS,
  RESET_SPECIFIC_DC_STATE
} from "constants/action-types"

import { compose, lensProp, over, set } from "ramda"

import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import createReducer from "utils/redux/create-reducer"

export const initialState = {
  initialRender: {
    done: false,
    pending: false,
    error: false,
    numCharts: 0,
    counter: 0
  },
  render: {},
  redraw: {
    id: null,
    done: false,
    pending: false,
    error: false
  },
  redrawAll: {
    done: false,
    pending: false,
    error: false
  },
  renderAll: {
    done: false,
    pending: false,
    error: false
  }
}

const isInitialRenderDone = ({ initialRender }) =>
  !initialRender.error &&
  (initialRender.done || initialRender.numCharts === initialRender.counter)

const overRedraw = over(lensProp("redraw"))
const overInitialRender = over(lensProp("initialRender"))
const overRedrawAll = over(lensProp("redrawAll"))
const overRenderAll = over(lensProp("renderAll"))

const setDone = compose(
  set(lensProp("done"), true),
  set(lensProp("pending"), false),
  set(lensProp("error"), false)
)

const setPending = compose(
  set(lensProp("done"), false),
  set(lensProp("pending"), true),
  set(lensProp("error"), false)
)

const setError = (e) =>
  compose(
    set(lensProp("done"), false),
    set(lensProp("pending"), false),
    set(lensProp("error"), e)
  )

const setId = (id) => set(lensProp("id"), id)

const DC_STATE_DONE = {
  done: true,
  pending: false,
  error: false
}

const DC_STATE_PENDING = {
  done: false,
  pending: true,
  error: false
}

const dcReducers = {
  [CHART_REDRAW_REQUEST](state, { id }) {
    return overRedraw(compose(setId(id), setPending))(state)
  },

  [CHART_REDRAW_SUCCESS](state, { id }) {
    return overRedraw(compose(setId(id), setDone))(state)
  },

  [CHART_REDRAW_ERROR](state, { error, id }) {
    return overRedraw(compose(setId(id), setError(error)))(state)
  },

  [REDRAW_ALL_REQUEST]: overRedrawAll(setPending),

  [REDRAW_ALL_SUCCESS]: overRedrawAll(setDone),

  [REDRAW_ALL_ERROR]: (state, { error }) =>
    overRedrawAll(setError(error))(state),

  [RENDER_ALL_REQUEST]: overRenderAll(setPending),

  [RENDER_ALL_SUCCESS]: overRenderAll(setDone),

  [RENDER_ALL_ERROR]: (state, { error }) =>
    overRenderAll(setError(getErrorMessageFromBackendError(error)))(state),

  [CHART_RENDER_REQUEST]: (state, { id }) => {
    return {
      ...state,
      initialRender: isInitialRenderDone(state)
        ? state.initialRender
        : { ...state.initialRender, ...DC_STATE_PENDING },
      render: {
        ...state.render,
        [id]: {
          ...DC_STATE_PENDING
        }
      },
      redraw: isInitialRenderDone(state)
        ? { id, done: false, pending: false, error: false }
        : state.redraw
    }
  },

  [CHART_RENDER_SUCCESS]: (state, { id }) => {
    return {
      ...state,
      render: {
        ...state.render,
        [id]: {
          ...DC_STATE_DONE
        }
      },
      initialRender: {
        ...state.initialRender,
        counter: isInitialRenderDone(state)
          ? state.initialRender.counter
          : state.initialRender.counter + 1
      }
    }
  },

  [CHART_RENDER_ERROR]: (state, { error, id }) => {
    return isInitialRenderDone(state)
      ? {
          ...state,
          render: {
            ...state.render,
            [id]: { done: false, pending: false, error }
          }
        }
      : {
          ...state,
          initialRender: { done: false, pending: false, error }
        }
  },

  [INITIAL_RENDER_BEGIN]: overInitialRender(setPending),

  [INITIAL_RENDER_DONE]: overInitialRender(setDone),

  [INITIAL_RENDER_ERROR]: (state, { error }) =>
    overInitialRender(setError(getErrorMessageFromBackendError(error)))(state),

  [RESET_SPECIFIC_DC_STATE]: (state, { key }) => {
    if (state[key]) {
      if (key === "render") {
        return {
          ...state,
          render: {}
        }
      }

      return over(
        lensProp(key),
        compose(
          set(lensProp("done"), false),
          set(lensProp("pending"), false),
          set(lensProp("error"), false)
        )
      )(state)
    } else {
      return state
    }
  }
}

export default createReducer(dcReducers, initialState)
