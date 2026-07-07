// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ViewState } from "react-map-gl"
import { LAYER_TYPE } from "../constants"
import { MapSettings } from "../types"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  addBoundingBoxFilter,
  aggrFuncWithAlias,
  astLiteral,
  expression,
  getAST,
  sqlify
} from "../ast-helpers"
import Services from "services/immerse"
import { debounce } from "lodash"

export const useResultCount = (
  chartKey: LAYER_TYPE,
  query: string,
  viewState: ViewState,
  mapConfig: MapSettings
) => {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const queryResultCount = useCallback(() => {
    setLoading(true)
    setCount(null)
    const countAlias = "resultCount"
    const boundedQuery = addBoundingBoxFilter(
      chartKey,
      query,
      viewState,
      mapConfig
    )
    const boundedAST = getAST(boundedQuery)
    boundedAST.columns = [
      expression(
        aggrFuncWithAlias("COUNT", expression(astLiteral("star", "*"))),
        countAlias
      )
    ]
    boundedAST.limit = null
    return Services.get("DbCon")
      .queryAsync(sqlify(boundedAST))
      .then((resp: Array<{ resultCount: number }>) => {
        setCount(resp[0][countAlias])
      })
      .catch((e: Error) => {
        // eslint-disable-next-line no-console
        console.error(e)
        setCount(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [chartKey, mapConfig, query, viewState])

  const queryResultCountDebounced = useMemo(() => {
    return debounce(queryResultCount, 200)
  }, [queryResultCount])

  useEffect(() => {
    queryResultCountDebounced()
    return () => {
      queryResultCountDebounced.cancel()
    }
  }, [queryResultCountDebounced])

  return [count, loading]
}
