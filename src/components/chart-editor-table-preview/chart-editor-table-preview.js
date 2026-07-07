// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from "react"
import PropTypes from "prop-types"
import "moment-duration-format"
import LoadingWidget from "components/app-overlay/loading-widget"
import { rowCountShape } from "constants/prop-types"
import TableInfo from "components/table-preview/table-info"
import TablePreviewError from "components/data-manager/table-preview-error/table-preview-error"
import "./styles.scss"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import IconJoinLeft from "components/svg-icons/icon-join-left"

ChartEditorTablePreview.propTypes = {
  error: PropTypes.bool.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  numberWithCommas: PropTypes.func.isRequired,
  requestTablePreview: PropTypes.func.isRequired,
  rowCount: rowCountShape,
  isView: PropTypes.bool
}

export default function ChartEditorTablePreview({
  error,
  loading,
  name,
  rowCount,
  numberWithCommas,
  fields = [],
  viewSql,
  isView,
  requestTablePreview
}) {
  const tableOrView = isView ? "View" : "Table"

  // If datasource is set we should use that, otherwise value is a
  // table name
  const queryDataSource = name
  const joinDataSource = useJoinFromParameter(queryDataSource)
  const displayName = joinDataSource ? joinDataSource.name : queryDataSource
  const join = joinDataSource?.joins?.[0]

  useEffect(() => {
    requestTablePreview(name)
  }, [requestTablePreview, name])

  return (
    <div className="table-preview-module">
      <div className="chart-editor-table-preview-wrapper">
        {error && <TablePreviewError />}
        {loading && (
          <div className="chart-editor-table-preview-loading">
            <LoadingWidget message={"Loading Data Preview"} />
          </div>
        )}
        <div className="chart-editor-table-preview-half">
          <div className="chart-editor-table-preview-info">
            <div className="table-name" data-testid="table-info-name">
              <div className="table-info-label">{`${tableOrView} Name`}</div>
              <div className="table-name-value">
                {joinDataSource && (
                  <div className="data-source-icon">
                    <IconJoinLeft />
                  </div>
                )}
                <div>{displayName}</div>
              </div>
            </div>
            {rowCount && (
              <div className="table-stat">
                <div className="table-info-label">{rowCount.label}</div>
                <div id="table-rows-num">
                  {numberWithCommas(rowCount.value)}
                </div>
              </div>
            )}
            {fields && (
              <div className="table-stat">
                <div className="table-info-label">Columns</div>
                <div id="table-columns-num">
                  {numberWithCommas(fields.length)}
                </div>
              </div>
            )}
            {isView && (
              <div className="table-stat">
                <div className="table-info-label">View SQL</div>
                <div className="table-sql">{viewSql}</div>
              </div>
            )}
            {join && (
              <div>
                <div className="table-stat">
                  <div className="table-info-label">Join Tables</div>
                  <div id="join-tables">
                    {[join.leftTable, join.rightTable].join(", ")}
                  </div>
                </div>
                <div className="table-stat">
                  <div className="table-info-label">Join Type</div>
                  <div id="join-type">{join.joinType}</div>
                </div>
                <div className="table-stat">
                  <div className="table-info-label">Join Keys</div>
                  <div id="join-keys">
                    {[join.leftJoinKey, join.rightJoinKey].join(", ")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="chart-editor-table-preview-half">
          <TableInfo fields={fields} />
        </div>
      </div>
    </div>
  )
}
