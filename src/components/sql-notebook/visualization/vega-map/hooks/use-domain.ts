// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChartField, VegaTypeMap } from "components/sql-notebook/types"
import { asContinuousDomainQuery, asOrdinalDomainQuery } from "../ast-helpers"
import { useEffect, useState } from "react"
import Services from "services/immerse"

type ContinuousDomainResponse = Array<{
  min: number
  max: number
}>
type OrdinalDomainResponse = Array<{
  [key: string]: string
}>

export const useDomain = (
  field: ChartField,
  query: string,
  limit = 20
): [number[] | string[], string | null, boolean] => {
  const [domain, setDomain] = useState<number[] | string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || !field?.field) {
      setDomain([])
      return
    }
    let domainQuery = null
    if (field?.type === VegaTypeMap.STRING) {
      try {
        domainQuery = asOrdinalDomainQuery(query, limit, field.field)
      } catch (e) {
        setError(`Error parsing query: ${e?.message || "Unknown Error"}`)
      }
      if (domainQuery) {
        setLoading(true)
        Services.get("DbCon")
          .queryAsync(domainQuery)
          .then((resp: OrdinalDomainResponse) => {
            setError(null)
            setDomain(resp.map((row) => Object.values(row)[0]))
          })
          .catch((e) => {
            setError(e.message || e.error_msg || "Query Error")
          })
          .finally(() => {
            setLoading(false)
          })
      }
    } else if (field?.type === VegaTypeMap.NUMBER) {
      try {
        domainQuery = asContinuousDomainQuery(query, field.field)
      } catch (e) {
        setError(`Error parsing query: ${e?.message || "Unknown Error"}`)
      }

      setLoading(true)
      Services.get("DbCon")
        .queryAsync(domainQuery)
        .then((resp: ContinuousDomainResponse) => {
          const minMax = resp[0]
          setError(null)
          setDomain([minMax?.min ?? 0, minMax?.max ?? 0])
        })
        .catch((e) => {
          setError(e.message || e.error_msg || "Query Error")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setDomain([])
    }
  }, [query, limit, field])

  return [domain, error, loading]
}
