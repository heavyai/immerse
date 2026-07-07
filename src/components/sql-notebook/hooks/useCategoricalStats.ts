// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ColumnMetadata } from "constants/prop-types"
import { useEffect, useRef, useState } from "react"
import Services from "services/immerse"

type Stat = {
  label: string
  value: number | string
  tooltip?: string
}
type CategoricalStats = Array<Stat>
type StatQueryResults = [
  {
    cardinality: number
    mode: number
    leastFrequent: string
  }
]

export const useCategoricalStats = (
  columnMetadata: ColumnMetadata
): [CategoricalStats, boolean, string | null] => {
  const dbConRef = useRef()

  const query = `
    WITH frequency_stats as (
      SELECT
        ${columnMetadata.value} as leastFrequent,
        count(*) as numRecords
      from
        ${columnMetadata.table}
      group by
        leastFrequent
      order by
        numRecords ASC
      LIMIT
        1
    ),
    other_stats AS (
      SELECT
        APPROX_COUNT_DISTINCT(${columnMetadata.value}) AS 'cardinality',
        MODE(${columnMetadata.value}) AS 'mode'
      FROM
        ${columnMetadata.table}
    )
    SELECT
      "cardinality",
      "mode",
      "leastFrequent"
    FROM
      other_stats
      JOIN frequency_stats ON 1 = 1`

  const [stats, setStats] = useState<CategoricalStats>([])
  const [error, setError] = useState<null | string>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dbConRef.current) {
      dbConRef.current = Services.get("DbCon")
    }
    // Don't start the loading spinner at all if it's < 100ms to
    // prevent blinky behavior
    const loadingTimer = setTimeout(() => {
      setLoading(true)
    }, 100)
    setError(null)
    dbConRef.current
      ?.queryAsync(query)
      .then((results: StatQueryResults) => {
        clearTimeout(loadingTimer)
        setLoading(false)
        const { cardinality, mode, leastFrequent } = results[0]
        setStats([
          {
            label: "Cardinality",
            value: cardinality
          },
          {
            label: "Mode",
            value: mode
          },
          {
            label: "Least Frequent",
            value: leastFrequent
          }
        ])
      })
      .catch((e: Error) => {
        setError(
          e?.message || e?.error_message || "Error fetching column summary"
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [query])
  return [stats, loading, error]
}
