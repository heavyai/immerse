// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { QueryHistory } from "components/sql-editor/types"
import APP_CONFIG from "../constants/app-config"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_GET,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../constants/services"

// Stores a single history entry in Immerse user metadata
export const addQueryHistory = async (queryHistory: QueryHistory) => {
  return fetch(`${APP_CONFIG.url}/query-history`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify(queryHistory)
    }
  })
}

// Returns query history for current database. Payload should match redux `history` state.
export const getQueryHistory = async () => {
  return fetch(`${APP_CONFIG.url}/query-history`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_GET
    }
  })
}
