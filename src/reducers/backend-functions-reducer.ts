// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  LOAD_TABLE_FUNCTIONS_REQUEST,
  LOAD_TABLE_FUNCTIONS_SUCCESS
} from "constants/action-types"

import createReducer from "utils/redux/create-reducer"
import { TUserDefinedTableFunction } from "@heavyai/connector/dist/browser-connector"

type BackendFunctionsState = {
  loadingTableFunctions: boolean
  tableFunctions: TUserDefinedTableFunction[]
}

export const initialState: BackendFunctionsState = {
  loadingTableFunctions: false,
  tableFunctions: []
}

export const reducers = {
  [LOAD_TABLE_FUNCTIONS_REQUEST](state: BackendFunctionsState) {
    return { ...state, loadingTableFunctions: true }
  },

  [LOAD_TABLE_FUNCTIONS_SUCCESS](
    state: BackendFunctionsState,
    { tableFunctions }: { tableFunctions: TUserDefinedTableFunction[] }
  ) {
    return { ...state, loadingTableFunctions: false, tableFunctions }
  }
}

export default createReducer(reducers, initialState)
