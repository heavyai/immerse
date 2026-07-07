// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useEffect } from "react"
import PropTypes from "prop-types"
import moment from "moment"
import "moment-duration-format"
import { rowCountShape } from "constants/prop-types"
import Icon from "components/icon/icon"
import LoadingWidget from "components/app-overlay/loading-widget"
import { SecondaryButton } from "widgets/button/Button"

import TableInfo from "components/table-preview/table-info"
import SampleRows from "components/table-preview/sample-rows"

const TablePreview = memo(
  ({
    dropDataSourceEnabled,
    truncTableEnabled,
    appendTableEnabled,
    dropDataSource,
    truncTable,
    goToAppendData,
    error,
    loading,
    name,
    rowCount,
    numberWithCommas,
    fields = [],
    isView,
    showTableActions,
    wasImported,
    wasS3,
    importStartTime,
    importEndTime,
    sampleRows = [],
    requestTablePreview,
    trackS3Import,
    trackSourceImport
  }) => {
    useEffect(() => {
      requestTablePreview(name)
    }, [name]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!loading && wasImported) {
        if (wasS3) {
          trackS3Import(fields.length, rowCount)
        } else {
          trackSourceImport(fields.length, rowCount)
        }
      }
    }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

    const tableOrView = isView ? "View" : "Table"

    const importTime =
      wasImported &&
      moment
        .duration(
          Math.max(moment(importEndTime).diff(moment(importStartTime)), 0)
        )
        .format("hh:*mm:ss")

    return (
      <div className="table-preview-module">
        <div className="table-preview-wrapper">
          {error && (
            <div className="table-preview-error">
              <div className="data-preview">
                <div className="preview-icon">
                  <Icon name="chart-table" />
                </div>
                <span>Cannot Preview</span>
              </div>
            </div>
          )}
          {loading && (
            <div className="table-preview-loading">
              <LoadingWidget message={"Loading Data Preview"} />
            </div>
          )}
          <div className="table-preview-info">
            <div className="table-name" data-testid="table-info-name">
              {name}
            </div>
            <div className="table-metric">
              <span className="table-metric-label">Columns</span>
              <br />
              {numberWithCommas(fields.length)}
            </div>
            {rowCount && (
              <div className="table-metric">
                <span className="table-metric-label">{rowCount.label}</span>
                <br />
                {numberWithCommas(rowCount.value)}
              </div>
            )}
            {wasImported && (
              <div className="table-metric">
                <div className="table-metric-label">Total Import Time</div>
                {importTime}
              </div>
            )}
          </div>
          {showTableActions && (
            <div className="table-actions">
              {dropDataSourceEnabled && (
                <SecondaryButton
                  data-testid={"table-preview-delete-table"}
                  onClick={dropDataSource(name, isView)}
                >
                  Delete {tableOrView}
                </SecondaryButton>
              )}
              {truncTableEnabled && (
                <SecondaryButton
                  data-testid={"table-preview-delete-all-rows"}
                  onClick={truncTable(name)}
                >
                  Delete All Rows
                </SecondaryButton>
              )}
              {appendTableEnabled && (
                <SecondaryButton
                  data-testid={"table-preview-append-data"}
                  onClick={goToAppendData(name)}
                >
                  Append Data
                </SecondaryButton>
              )}
            </div>
          )}
          {sampleRows.length ? (
            <SampleRows fields={fields} sampleRows={sampleRows} />
          ) : (
            <TableInfo fields={fields} />
          )}
        </div>
      </div>
    )
  }
)

TablePreview.propTypes = {
  error: PropTypes.bool.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  numberWithCommas: PropTypes.func.isRequired,
  requestTablePreview: PropTypes.func.isRequired,
  rowCount: rowCountShape,
  rowsRejected: PropTypes.number.isRequired,
  importStartTime: PropTypes.number,
  importEndTime: PropTypes.number,
  trackS3Import: PropTypes.func,
  trackSourceImport: PropTypes.func,
  wasImported: PropTypes.bool,
  wasS3: PropTypes.bool,
  dropDataSource: PropTypes.func,
  truncTable: PropTypes.func,
  goToAppendData: PropTypes.func,
  dropDataSourceEnabled: PropTypes.bool,
  truncTableEnabled: PropTypes.bool,
  appendTableEnabled: PropTypes.bool,
  isView: PropTypes.bool,
  showTableActions: PropTypes.bool,
  sampleRows: PropTypes.arrayOf(PropTypes.object)
}

TablePreview.displayName = "TablePreview"

export default TablePreview
