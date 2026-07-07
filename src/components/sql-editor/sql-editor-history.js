// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { connect, useDispatch } from "react-redux"
import PropTypes from "prop-types"
import { Icon } from "@rmwc/icon"
import moment from "moment"
import CodeMirror from "codemirror"
import "codemirror/addon/runmode/runmode"
import "codemirror/mode/meta"
import "codemirror/mode/sql/sql"
import Highlighter from "react-codemirror-runmode"
import { loadQueryHistory } from "actions/sql-editor-action-creators"
import LoadingWidget from "components/app-overlay/loading-widget"
import { SQL_EDITOR_TEST_ID_QUERY_INFO } from "./constants"
import SqlEditorHistoryItem from "./sql-editor-history-item"
import { resultsMetaText } from "./sql-editor-results"
import SqlEditorDataViewerParent from "./sql-editor-data-viewer-parent"
import "codemirror/theme/monokai.css"
import {
  isThemeDark,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

const mapStateToProps = ({
  sqlEditor: { history, loadingHistory, loadedHistory }
}) => ({
  history,
  loadingHistory,
  loadedHistory
})

const connector = connect(mapStateToProps)

const SqlEditorHistory = ({
  history,
  insertAtCursor,
  loadingHistory,
  loadedHistory
}) => {
  const dispatch = useDispatch()
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null)
  const closeSelectedQueryPane = () => {
    setSelectedHistoryIndex(null)
  }

  useEffect(() => {
    if (!loadingHistory && !loadedHistory) {
      dispatch(loadQueryHistory())
    }
  }, [dispatch, loadedHistory, loadingHistory])

  return (
    <>
      <div className="sql-editor__history">
        {/* No need to block interaction here if any queries manage to run before previous history is loaded */}
        {loadingHistory && history.length === 0 && <LoadingWidget />}
        {history.length === 0 && (
          <div className="no-history-message">
            Queries you run will appear here.
          </div>
        )}
        {history.map((query, index) => (
          <SqlEditorHistoryItem
            item={query}
            key={`${query.query}-${index}`}
            selected={selectedHistoryIndex === index}
            setSelected={() => setSelectedHistoryIndex(index)}
            insertAtCursor={() => insertAtCursor(query.query)}
          />
        ))}
      </div>
      {selectedHistoryIndex !== null &&
        history &&
        history[selectedHistoryIndex] && (
          <SelectedQueryInfo
            query={history[selectedHistoryIndex]}
            closeSelectedQueryPane={closeSelectedQueryPane}
          />
        )}
    </>
  )
}

const SelectedQueryInfo = ({ query, closeSelectedQueryPane }) => {
  const DATE_FORMAT = "dddd, MMMM Do YYYY, h:mm:ss a"
  const { theme } = useImmerseUITheme()
  return (
    <div
      className="sql-editor---new__selected-query-info"
      data-testid={SQL_EDITOR_TEST_ID_QUERY_INFO}
    >
      <Icon icon="close" onClick={closeSelectedQueryPane} />
      <div className="query-timestamp">{`Ran at: ${moment(
        query.timestamp
      ).format(DATE_FORMAT)}`}</div>
      <div className="meta">{resultsMetaText(query)}</div>

      <div className="section-title">Query</div>
      <div className="query">
        <Highlighter
          codeMirror={CodeMirror}
          theme={isThemeDark(theme) ? "monokai" : "default"}
          value={query.query}
          language="sql"
        />
      </div>

      <div className="result">
        {query.results &&
          (query.isVega ? (
            query.results.image ? (
              <div className="sql-editor__results__vega-image-backdrop">
                <img
                  src={`data:image/gif;base64,${query.results.image}`}
                  alt="Vega result"
                />
              </div>
            ) : (
              "No image result"
            )
          ) : (
            query.results.fields && (
              <>
                <div className="section-title">Results preview</div>
                <SqlEditorDataViewerParent
                  data={query.results}
                  query={query.query}
                  dataViewerHeight={300}
                />
              </>
            )
          ))}
      </div>
    </div>
  )
}

SqlEditorHistory.propTypes = {
  insertAtCursor: PropTypes.func,
  history: PropTypes.arrayOf(PropTypes.object)
}

SqlEditorHistoryItem.propTypes = {
  query: PropTypes.shape({
    query: PropTypes.string,
    timestamp: PropTypes.string,
    results: PropTypes.object
  }),
  closeSelectedQueryPane: PropTypes.func
}

export default connector(SqlEditorHistory)
