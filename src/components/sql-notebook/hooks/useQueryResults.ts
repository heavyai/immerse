// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import services from "services/immerse"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { tableToFields, tableToJson } from "utils/arrow"
import {
  runFilteredQuery,
  sqlNotebookSetLoading
} from "components/sql-notebook/redux/sql-notebook-action-creators"
import { isJson, limitQuery } from "../utils"
import { QUERY_LIMIT } from "../constants"

export const useQuery = (query = "") => {
  const [results, setResults] = useState<Array<any> | null>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>()
  const dispatch = useDispatch()

  useEffect(() => {
    setError(null)
    const connector = services.get("DbCon")

    const trimmedQuery = query?.trim()
    if (!trimmedQuery) {
      setLoading(false)
      setError(new Error("No query provided"))
      return
    }
    const isVega = isJson(trimmedQuery)
    const table = trimmedQuery.match(/from\s+([^\s;]+)/i)?.[1]

    let limitedQuery = trimmedQuery
    const runQuery = async () => {
      if (!isVega) {
        limitedQuery = limitQuery(trimmedQuery)
      }

      try {
        let result = null
        setLoading(true)
        dispatch(sqlNotebookSetLoading(true))

        // find table from query string
        // const table = (await findDataSource(connector, trimmedQuery))[0]

        if (isVega) {
          result = await connector.renderVegaAsync(1, limitedQuery)
        } else if (
          getFeatureFlag(available_feature_flags.USE_ARROW_IN_SQL_MANAGER)
        ) {
          const data = await connector.queryDFAsync(limitedQuery, {
            returnTiming: true,
            limit: QUERY_LIMIT
          })

          result = {
            ...data,
            results: tableToJson(data.results),
            fields: tableToFields(data.results),
            table,
            // Persist the trimmed but not limited query
            query: trimmedQuery
          }
        } else {
          result = await runFilteredQuery(connector, limitedQuery)
          result.table = table
          // Persist the trimmed but not limited query
          result.query = trimmedQuery
        }
        setResults(result)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
        dispatch(sqlNotebookSetLoading(false))
      }
    }

    runQuery()
  }, [dispatch, query])

  return [results, loading, error]
}
