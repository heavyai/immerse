// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"

import { QUERY_LIMIT } from "actions/sql-editor-action-creators"
import { SQL_EDITOR_TEST_ID_RESULTS_META } from "./constants"

// TODO: Clean up/move this component when we remove the old SQL editor
import SqlEditorDataViewerParent from "components/sql-editor/sql-editor-data-viewer-parent"

export function resultsMetaText(queryResults, queryLimit = QUERY_LIMIT) {
  if (queryResults.results) {
    const { results } = queryResults

    // No row count - CREATE, ALTER, INSERT, DROP, or Vega renders
    let preamble = "Total time: "

    const totalTime =
      results.total_time_ms || results.timing?.total_time_ms || 0

    // Queries that return no rows like CREATE and INSERT have an empty list for
    // `fields`. We check the length of `fields` instead of `results` to differentiate
    // from cases where, for example, a SELECT returns no rows
    if (results.fields?.length) {
      const resultsCount = results.results.length

      preamble = `${
        resultsCount === queryLimit ? "Top " : ""
      }${resultsCount} row${resultsCount === 1 ? "" : "s"} in`
    }

    const executionTime =
      results.execution_time_ms || results.timing?.execution_time_ms
    const renderTime = results.render_time_ms
    const extraTimingValues = [
      ...(executionTime ? [`Query execution time: ${executionTime}ms`] : []),
      ...(renderTime ? [`Render time: ${renderTime}ms`] : [])
    ]

    const extraTiming = extraTimingValues.length
      ? ` (${extraTimingValues.join(", ")})`
      : ""

    return `${preamble} ${totalTime}ms${extraTiming}`
  }

  if (queryResults.error) {
    return queryResults.error
  }

  return ""
}
export default function SqlEditorResults({ queryResults, resultsTableHeight }) {
  return (
    <React.Fragment>
      <p
        className="sql-editor__results__meta"
        data-testid={SQL_EDITOR_TEST_ID_RESULTS_META}
      >
        {resultsMetaText(queryResults)}
      </p>
      {queryResults.isVega ? (
        queryResults.results?.image ? (
          <div className="sql-editor__results__vega-image-backdrop">
            <img
              src={`data:image/gif;base64,${queryResults.results.image}`}
              alt="Vega result"
            />
          </div>
        ) : (
          "No image result"
        )
      ) : (
        queryResults.results?.results && (
          <SqlEditorDataViewerParent
            data={queryResults.results}
            query={queryResults.query}
            dataViewerHeight={resultsTableHeight}
            lineHeight={20}
          />
        )
      )}
    </React.Fragment>
  )
}

SqlEditorResults.propTypes = {
  queryResults: PropTypes.object,
  resultsTableHeight: PropTypes.number
}
