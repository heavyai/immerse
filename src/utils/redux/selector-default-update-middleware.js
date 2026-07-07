// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  REDRAW_ALL_SUCCESS,
  SET_FILTER_CROSSFILTER_SUCCESS,
  TOGGLE_FILTER_CROSSFILTER_SUCCESS,
  DELETE_FILTER_CROSSFILTER_SUCCESS
} from "constants/action-types"
import { updateSelectorDefaults } from "actions/selector-default-thunks"

export default function selectorDefaultUpdateMiddleware() {
  return ({ dispatch }) => (next) => (action) => {
    if (
      [
        REDRAW_ALL_SUCCESS,
        SET_FILTER_CROSSFILTER_SUCCESS,
        TOGGLE_FILTER_CROSSFILTER_SUCCESS,
        DELETE_FILTER_CROSSFILTER_SUCCESS
      ].includes(action.type)
    ) {
      dispatch(updateSelectorDefaults(action.group))
    }

    return next(action)
  }
}
