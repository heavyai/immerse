// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"

import { VegaLite } from "react-vega"
import { ColumnMetadata } from "constants/prop-types"
import Services from "services/immerse"
import { VegaTypeMap } from "../../types"

import { LoaderWithHeight } from "../loader-with-height"
import { MESSAGE_TYPES, Message } from "components/message/message"
import {
  VISUALIZATION_HEIGHT,
  createCategoricalSummarySpec,
  getCategoricalSummaryQuery
} from "../utils"
import { TopLevelSpec } from "vega-lite"

import "./categorical-summary-chart.scss"
import { useImmerseUITheme } from "utils/theme/use-immerse-ui-theme"

const countAlias = "bucketCount"
const bucketAlias = "bucketValue"

export const CategoricalSummaryChart = ({
  column,
  numBuckets = 10
}: {
  column: ColumnMetadata
  numBuckets?: number
}) => {
  const [vegaData, setVegaData] = useState<{ table: Array<any> }>()
  const [vegaSpec, setVegaSpec] = useState<TopLevelSpec>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { theme } = useImmerseUITheme()

  useEffect(() => {
    const query = getCategoricalSummaryQuery(column, numBuckets, {
      countAlias,
      bucketAlias
    })
    const dbCon = Services.get("DbCon")
    setLoading(true)
    dbCon
      .queryAsync(query)
      .then((result: Array<any>) => {
        setVegaData({ table: result })
        const newSpec = createCategoricalSummarySpec(
          { field: countAlias, type: VegaTypeMap.NUMBER },
          { field: bucketAlias, type: VegaTypeMap.STRING },
          theme
        )
        setVegaSpec(newSpec)
      })
      .catch((e: Error) => {
        setError(
          e?.message || e?.error_message || "Error generating summary chart"
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [column, numBuckets])

  return (
    <div className="sql-notebook-chart-container">
      {loading && <LoaderWithHeight height={VISUALIZATION_HEIGHT} />}
      {error && <Message type={MESSAGE_TYPES.ERROR} message={error || ""} />}
      {vegaSpec && vegaData && !loading && (
        <VegaLite
          spec={vegaSpec}
          data={vegaData}
          actions={false}
          theme="dark"
          tooltip={false}
        />
      )}
    </div>
  )
}
