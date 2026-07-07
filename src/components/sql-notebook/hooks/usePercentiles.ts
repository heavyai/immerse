// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ColumnMetadata } from "constants/prop-types"
import { ROLLUP_COLUMN_TYPES, getRollupType } from "../data-preview/utils"
import { useEffect, useRef, useState } from "react"
import Services from "services/immerse"

type PercentileList = Array<number>

export const usePercentiles = (
  column: ColumnMetadata,
  percentilesList: PercentileList = [0, 1]
): [Array<number> | null, boolean, string | null] => {
  const [percentiles, setPercentiles] = useState<null | Array<number>>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const dbConRef = useRef()

  useEffect(() => {
    const rollupType = getRollupType(column.type)
    setPercentiles(null)
    if (!dbConRef.current) {
      dbConRef.current = Services.get("DbCon")
    }
    switch (rollupType) {
      case ROLLUP_COLUMN_TYPES.NUMERIC:
        {
          const selectItems = percentilesList
            .map((p) => `APPROX_PERCENTILE(${column.value}, ${p})`)
            .join(", ")
          const query = `SELECT ${selectItems} from ${column.table}`
          setLoading(true)
          dbConRef.current
            ?.queryAsync(query)
            .then((result: any) => {
              setError(null)
              const p = result[0]
              // TODO: Can we guarantee order here?
              setPercentiles(Object.values(p))
            })
            .catch((e) => {
              setError(
                e?.message ||
                  e?.error_message ||
                  `Error fetching percentiles for column ${column?.value}`
              )
            })
            .finally(() => {
              setLoading(false)
            })
        }
        break
      default:
        break
    }
  }, [column, percentilesList])

  return [percentiles, loading, error]
}
