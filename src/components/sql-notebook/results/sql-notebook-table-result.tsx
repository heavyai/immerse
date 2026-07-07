// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import SqlEditorDataViewer from "components/sql-editor/sql-editor-data-viewer"
import { resultsMetaText } from "components/sql-editor/sql-editor-results"
import "./sql-notebook-table-result.scss"
import { QUERY_LIMIT } from "../constants"
import { ResultsLoadingSpinner } from "./results-loading-spinner"

const SQL_EDITOR_MAX_HEIGHT = 350
// Min height of 0 causes weird things to happen with data view
// 1 makes sure the elements are still there
const SQL_EDITOR_MIN_HEIGHT = 1
export const SqlNotebookTableResult = ({
  data,
  loading
}: {
  data: any
  loading: boolean
}) => {
  const [viewerHeight, setViewerHeight] = useState(SQL_EDITOR_MIN_HEIGHT)
  const setColumnViewerHeight = (height: number) => {
    setViewerHeight(Math.min(height, SQL_EDITOR_MAX_HEIGHT))
  }
  const metaText = data
    ? resultsMetaText(
        {
          results: {
            fields: data.fields,
            results: data.results,
            ...data.timing
          }
        },
        QUERY_LIMIT
      )
    : null

  // When running a query with no results, setColumnViewerHeight is not called
  // we'll set it to the min ourselves when no results
  useEffect(() => {
    if (!data?.results?.length) {
      setViewerHeight(SQL_EDITOR_MIN_HEIGHT)
    }
  }, [data])

  return (
    <div className="sql-notebook-table-result">
      {loading && <ResultsLoadingSpinner hasData={data} />}
      {data?.fields && (
        <div style={{ height: viewerHeight }}>
          {!loading && (
            <SqlEditorDataViewer
              data={data}
              minRowHeight="48"
              charWidth="12"
              lineHeight="14"
              showColumnTypes
              setViewerHeight={setColumnViewerHeight}
              viewerHeight={viewerHeight}
            />
          )}
        </div>
      )}
      {!data && !loading && <div> No Data </div>}
      {data && <p className="sql-notebook-table-result__meta">{metaText}</p>}
    </div>
  )
}
