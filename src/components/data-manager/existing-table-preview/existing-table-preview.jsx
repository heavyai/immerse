// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useEffect } from "react"
import PropTypes from "prop-types"
import { rowCountShape } from "constants/prop-types"
import LoadingWidget from "components/app-overlay/loading-widget"
import TablePreviewHeader from "components/data-manager/table-preview-header"
import { buildTablePreviewMetrics } from "components/data-manager/table-preview-utils"
import ExistingTableActionsHeader from "components/data-manager/existing-table-preview/existing-table-actions-header"
import TablePreviewError from "components/data-manager/table-preview-error/table-preview-error"
import TableInfo from "components/table-preview/table-info"
import SampleRows from "components/table-preview/sample-rows"

import "../table-preview.scss"

const ExistingTablePreview = memo(
  ({
    error,
    loading,
    rowCount,
    fields = [],
    isView,
    wasImported,
    importStartTime,
    importEndTime,
    sampleRows = [],
    requestTablePreview,
    dataSourcePrivileges,
    tableName,
    isFsiConnectedSource,
    refreshInfo,
    rowsRejected,
    showComments,
    tableComment,
    columnComments
  }) => {
    useEffect(() => {
      requestTablePreview(tableName)
    }, [requestTablePreview, tableName])

    const tableFields = showComments
      ? fields.map((field, i) => ({
          ...field,
          comment: columnComments[i]
        }))
      : fields

    return (
      <div className="table-preview-module">
        <div className="table-preview-wrapper">
          {error && <TablePreviewError />}
          {loading && (
            <div className="table-preview-loading">
              <LoadingWidget message={"Loading Data Preview"} />
            </div>
          )}
          <TablePreviewHeader
            tableName={tableName}
            tableComment={showComments && tableComment}
            metrics={buildTablePreviewMetrics({
              columns: fields?.length,
              rows: !wasImported && rowCount?.value,
              rowsImported: wasImported && rowCount?.value,
              rowsRejected: wasImported && rowsRejected,
              importStartTime: wasImported && importStartTime,
              importEndTime: wasImported && importEndTime,
              isFsiConnectedSource,
              refreshInfo
            })}
          />
          <ExistingTableActionsHeader
            {...{
              isView,
              dataSourcePrivileges,
              loading,
              tableName,
              isFsiConnectedSource
            }}
          />
          {sampleRows.length ? (
            <SampleRows sampleRows={sampleRows} fields={fields} />
          ) : (
            <TableInfo fields={tableFields} showComments={showComments} />
          )}
        </div>
      </div>
    )
  }
)

ExistingTablePreview.propTypes = {
  error: PropTypes.bool.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool.isRequired,
  requestTablePreview: PropTypes.func.isRequired,
  rowCount: rowCountShape,
  rowsRejected: PropTypes.number.isRequired,
  importStartTime: PropTypes.number,
  importEndTime: PropTypes.number,
  isView: PropTypes.bool,
  sampleRows: PropTypes.arrayOf(PropTypes.object),
  tableName: PropTypes.string.isRequired
}

ExistingTablePreview.displayName = "ExistingTablePreview"

export default ExistingTablePreview
