// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_DELETE,
  HTTP_METHOD_PATCH,
  JSON_HEADERS
} from "constants/services"

// Services for setting table and column comment metadata

export const setTableComment = async (
  tableName: string,
  comment: string
): Promise<Response> => {
  const escapedComment = comment.replaceAll("'", "''")

  return fetch(`${APP_CONFIG.url}/tables/${tableName}/table-comment`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_PATCH,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        comment: escapedComment
      })
    }
  })
}

export const setColumnComment = async (
  tableName: string,
  columnName: string,
  comment: string
): Promise<Response> => {
  const escapedComment = comment.replaceAll("'", "''")

  return fetch(`${APP_CONFIG.url}/tables/${tableName}/column-comment`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_PATCH,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        columnName,
        comment: escapedComment
      })
    }
  })
}

export const deleteColumnComment = async (
  tableName: string,
  columnName: string
): Promise<Response> =>
  await fetch(`${APP_CONFIG.url}/tables/${tableName}/column-comment`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_DELETE,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        columnName
      })
    }
  })

export const deleteTableComment = async (
  tableName: string
): Promise<Response> =>
  await fetch(`${APP_CONFIG.url}/tables/${tableName}/table-comment`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_DELETE,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        tableName
      })
    }
  })
