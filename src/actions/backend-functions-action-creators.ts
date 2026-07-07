// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  LOAD_TABLE_FUNCTIONS_REQUEST,
  LOAD_TABLE_FUNCTIONS_SUCCESS
} from "constants/action-types"
import { getTableFunctions } from "../utils/table-functions"
import { TUserDefinedTableFunction } from "@heavyai/connector/dist/browser-connector"
import { Dispatch } from "redux"

export function loadTableFunctionsRequest() {
  return {
    type: LOAD_TABLE_FUNCTIONS_REQUEST
  }
}

export function loadTableFunctionsSuccess(
  tableFunctions: TUserDefinedTableFunction[]
) {
  return {
    type: LOAD_TABLE_FUNCTIONS_SUCCESS,
    tableFunctions
  }
}

export function loadTableFunctions() {
  return async function loadTableFunctionsThunk(dispatch: Dispatch) {
    dispatch(loadTableFunctionsRequest())

    const tableFunctions: TUserDefinedTableFunction[] = await getTableFunctions()
    dispatch(loadTableFunctionsSuccess(tableFunctions))
  }
}
