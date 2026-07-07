// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import { timeoutPromise } from "utils/timeout-promise"
import {
  BASE_FETCH_CONFIG,
  HTTP_METHOD_DELETE,
  HTTP_METHOD_POST,
  JSON_HEADERS
} from "../constants/services"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const NUMBER_OF_MS_TO_ATTEMPT_SESSION_CREATE = getFeatureFlag(
  available_feature_flags.NUMBER_OF_MS_TO_ATTEMPT_SESSION_CREATE
)

export const createSession = async (username, password, dbName) =>
  await fetch(`${APP_CONFIG.url}/session/create`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        username,
        password,
        dbName
      })
    }
  })

export const destroySession = async () =>
  await fetch(`${APP_CONFIG.url}/session/destroy`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_DELETE
    }
  })

export const destroyAllSessions = async () =>
  await fetch(`${APP_CONFIG.url}/session/destroy/all`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_DELETE
    }
  })

export const validateSession = async () =>
  await fetch(`${APP_CONFIG.url}/session/validate`, BASE_FETCH_CONFIG)

export const getSessionDurations = async () =>
  await fetch(`${APP_CONFIG.url}/session/durations`, BASE_FETCH_CONFIG)

export const getSessionDurationsCurrent = async () =>
  await fetch(`${APP_CONFIG.url}/session/durations/current`, BASE_FETCH_CONFIG)

export const modifySessionDurations = (
  { idleSessionDuration, maxSessionDuration },
  connectTimeDelta
) => ({
  idleSessionDuration: idleSessionDuration - connectTimeDelta,
  maxSessionDuration: maxSessionDuration - connectTimeDelta
})

export const createSessionWithTimeout = ({ username, password, database }) =>
  Promise.race([
    timeoutPromise(
      "Error: Unable to connect to Hostname or Port",
      NUMBER_OF_MS_TO_ATTEMPT_SESSION_CREATE
    ),
    createSession(username, password, database).then((resp) => {
      if (resp.ok) {
        return Promise.resolve(resp)
      } else {
        return resp
          .text()
          .then((message) => Promise.reject(message || "Invalid credentials"))
      }
    })
  ])

export const getDBAccessList = async () =>
  await fetch(`${APP_CONFIG.url}/session/db-access-list`, BASE_FETCH_CONFIG)

export const exchangeSession = async (dbName) =>
  await fetch(`${APP_CONFIG.url}/session/exchange`, {
    ...BASE_FETCH_CONFIG,
    ...{
      method: HTTP_METHOD_POST,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        dbName
      })
    }
  })

export const getPrivileges = async (dbName) =>
  await fetch(
    `${APP_CONFIG.url}/session/privileges${
      dbName ? `/${encodeURIComponent(dbName)}` : ""
    }`,
    BASE_FETCH_CONFIG
  )

export const getAllRolesForUser = async (username) =>
  await fetch(
    `${APP_CONFIG.url}/session/roles/${encodeURIComponent(username)}`,
    BASE_FETCH_CONFIG
  )

export const getTablePrivileges = async (table) =>
  await fetch(
    `${APP_CONFIG.url}/session/privileges/table/${encodeURIComponent(table)}`,
    BASE_FETCH_CONFIG
  )
