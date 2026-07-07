// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CONNECTION_TIMEOUT_ERROR,
  CHART_RENDER_ERROR,
  CHART_REDRAW_ERROR,
  TABLES_TRANSACTION_ERROR,
  GET_DASHBOARDS_ERROR,
  LOAD_DASHBOARD_ERROR,
  LOAD_DASHBOARD_DATA_ACCESS_ERROR,
  INITIAL_RENDER_ERROR,
  RENDER_ALL_ERROR,
  REDRAW_ALL_ERROR,
  SAVE_DASHBOARD_ERROR,
  DELETE_DASHBOARD_ERROR,
  SQL_EDITOR_PRIVILEGE_ERROR,
  GET_IMPORT_PREVIEW_DATA_ERROR,
  CREATE_NEW_TABLE_ERROR,
  IMPORT_TABLE_ERROR,
  REMOVE_IMPORT_FILES_ERROR,
  GET_USERS_ERROR,
  GET_ROLES_ERROR
} from "constants/action-types"
import { SAVE_DATABASE_STYLES_ERROR } from "actions/user-configurable-ui-action-creators"
import * as allErrorMsgs from "constants/error-messages"

export const DEFAULT_ERROR_MESSAGE = "An unknown error occurred."
export const BACKEND_ERROR_SESSION_NOT_VALID = "Session not valid"

// Exceptions from the backend store their error strings in different places
// depending on the type of exception. This ensures we always return some meaningful
// string without worrying about accidentally blowing up.
//
// NOTE: It would be lovely to move this into heavyai-connector and not have to call
// this helper function all over Immerse. But that might break other apps using heavyai-connector
// that are relying on the check for `.error_msg` or `.message`
export const getErrorMessageFromBackendError = (
  error,
  // Various areas of the code like to define their own default strings. This lets them
  // do that, or fallback to a generic default.
  { customDefault = "" } = {}
) => {
  let message = ""

  if (error) {
    message =
      typeof error === "object"
        ? // TMapDException uses error_msg while most other Thrift exceptions use message
          error.error_msg || error.message
        : String(error)
  }

  return message || customDefault || DEFAULT_ERROR_MESSAGE
}

const ERROR_TYPE_TO_HEADING_MAP = {
  [CONNECTION_TIMEOUT_ERROR]: allErrorMsgs.CONNECTION_TIMEOUT_ERROR_HEADING,
  [CHART_RENDER_ERROR]: allErrorMsgs.CHART_RENDER_ERROR_HEADING,
  [CHART_REDRAW_ERROR]: allErrorMsgs.CHART_REDRAW_ERROR_HEADING,
  [TABLES_TRANSACTION_ERROR]: allErrorMsgs.GET_TABLES_ERROR_HEADING,
  [GET_DASHBOARDS_ERROR]: allErrorMsgs.GET_DASHBOARDS_ERROR_HEADING,
  [LOAD_DASHBOARD_ERROR]: allErrorMsgs.LOAD_DASHBOARD_ERROR_HEADING,
  [LOAD_DASHBOARD_DATA_ACCESS_ERROR]:
    allErrorMsgs.LOAD_DASHBOARD_DATA_ACCESS_ERROR_HEADING,
  [INITIAL_RENDER_ERROR]: allErrorMsgs.INTIAL_RENDER_ERROR_HEADING,
  [RENDER_ALL_ERROR]: allErrorMsgs.RENDER_ALL_ERROR_HEADING,
  [REDRAW_ALL_ERROR]: allErrorMsgs.REDRAW_ALL_ERROR_HEADING,
  [SAVE_DASHBOARD_ERROR]: allErrorMsgs.SAVE_DASHBOARD_ERROR_HEADING,
  [DELETE_DASHBOARD_ERROR]: allErrorMsgs.DELETE_DASHBOARD_ERROR_HEADING,
  [SQL_EDITOR_PRIVILEGE_ERROR]: allErrorMsgs.SQL_EDITOR_PRIVILEGE_ERROR_HEADING,
  [GET_IMPORT_PREVIEW_DATA_ERROR]: allErrorMsgs.IMPORTER_ERROR,
  [CREATE_NEW_TABLE_ERROR]: allErrorMsgs.IMPORTER_ERROR,
  [IMPORT_TABLE_ERROR]: allErrorMsgs.IMPORTER_ERROR,
  [REMOVE_IMPORT_FILES_ERROR]: allErrorMsgs.IMPORTER_ERROR,
  [SAVE_DATABASE_STYLES_ERROR]: allErrorMsgs.SAVE_DATABASE_STYLES_ERROR_HEADING,
  [GET_USERS_ERROR]: allErrorMsgs.GET_USERS_ERROR_HEADING,
  [GET_ROLES_ERROR]: allErrorMsgs.GET_ROLES_ERROR_HEADING
}

// TODO: We might want to consider adding logging here if an unexpected errorType is passed;
// ideally we never show this generic default
export const getErrorHeadingFromErrorType = (errorType) =>
  ERROR_TYPE_TO_HEADING_MAP[errorType] || "An Error Occurred"
