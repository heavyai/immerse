// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  retrieveFromLocalStorage,
  storeInLocalStorage
} from "utils/local-storage"
export const GET_TABLES_META_PENDING = "GET_TABLES_META_PENDING"

export const getTablesMetaPending = (database: string) => ({
  type: GET_TABLES_META_PENDING,
  database
})

export const GET_TABLES_META_ERROR = "GET_TABLES_META_ERROR"
export const getTablesMetaError = (
  database: string,
  error: Error | string
) => ({
  type: GET_TABLES_META_ERROR,
  database,
  error
})

export const GET_TABLES_META_SUCCESS = "GET_TABLES_META_SUCCESS"
export const getTablesMetaSuccess = (
  database: string,
  results: TTableMeta
) => ({
  type: GET_TABLES_META_SUCCESS,
  database,
  results
})

const TABLES_META_CACHE_KEY = "tablesmeta"

export const getTablesMeta = () => async (dispatch, getState, services) => {
  const {
    connection: {
      user: { url, username },
      sessionInfo: { database } // Pretty sure this value is pretty accurate
    },
    tablesMeta
  } = getState()
  const connector = services.get("DbCon")

  // This is a very heavy call. If there are a lot of views on a database especially,
  // it will take a long time to process them all to refresh metadata - and what's
  // worse, that process blocks all queries for all users while it happens. We expect
  // this to only be called if needed, and then here we also check to see if it needs
  // to be called at all for this database. If not, we don't refresh it (so, we should
  // only be retrieving once for the current database in the current window)
  if (tablesMeta.results === null || database !== tablesMeta.database) {
    await dispatch(getTablesMetaPending(database))

    try {
      // Because it's so heavy, and because having stale results for the
      // duration of it isn't a big deal (they will be immediately and invisibly
      // replaced with the fresh results once those come back, further down),
      // store and retrieve the last results in a super simple cache - infinite
      // lifetime, size 1, current login + location only. This could definitely
      // be improved, but this will optimize for the most common use case.
      const cache = retrieveFromLocalStorage(TABLES_META_CACHE_KEY)

      const cacheParsed = cache && JSON.parse(cache)
      if (
        cacheParsed &&
        cacheParsed.database === database &&
        cacheParsed.url === url &&
        cacheParsed.username === username
      ) {
        dispatch(getTablesMetaSuccess(database, cacheParsed.results))
      }

      const results = await connector.getTablesMetaAsync()

      await dispatch(getTablesMetaSuccess(database, results))

      storeInLocalStorage(
        TABLES_META_CACHE_KEY,
        JSON.stringify({
          database,
          url,
          username,
          results
        })
      )
    } catch (error) {
      await dispatch(getTablesMetaError(database, error))
    }
  }
}
