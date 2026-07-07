// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  hideModal,
  showModal,
  showDangerModal,
  hideDangerModal
} from "actions/ui-action-creators"
import { connect } from "react-redux"
import { TSourceType } from "@heavyai/connector/dist/browser-connector"
import TablePreview from "./table-preview"
import { clearChangedColumnNameList } from "actions/importer-action-creators"

function primaryAction(dispatch) {
  return () => {
    dispatch(hideModal())
    dispatch(clearChangedColumnNameList())
  }
}

const maybeReplaceEmptyColumnName = (name, col) =>
  name || `empty column #${col + 1}`

export const createListOfColumnNameChanges = (data) => {
  let listOfChanges = ""
  data.changed_columns.forEach((col) => {
    listOfChanges = `${listOfChanges}${maybeReplaceEmptyColumnName(
      data.row_desc[col].col_name,
      col
    )} ➝ ${data.row_desc[col].clean_col_name} \n`
  })

  return listOfChanges
}

export const mapStateToProps = ({
  importer,
  connection: {
    user: { host, port, protocol },
    sessionId
  }
}) => ({
  hasPreviewDataFinishedLoading: Boolean(importer.data.row_set),
  importerData: importer.data,
  copyParams: importer.settings,
  filesToUpload: importer.connector.filesToImport,
  isDataCatalogImport: importer.connector.isDataCatalogImport,
  columnCountMismatch: Boolean(importer.columnCountMismatch),
  postUrl: `${protocol}://${host}:${port}`,
  sessionId
})

const dispatchHideDangerModal = (dispatch) => () => dispatch(hideDangerModal())

export const mapDispatchToProps = (dispatch) => ({
  showChangedColumnHeaders(changedHeaders) {
    return () => {
      dispatch(
        showModal({
          heading: "Column Header Names Changed",
          content: changedHeaders,
          primaryAction: {
            action: primaryAction(dispatch),
            text: "OK"
          }
        })
      )
    }
  },
  showColumnCountMismatchModal: () =>
    dispatch(
      showDangerModal({
        title: "Column Count Mismatch",
        message:
          "We've detected a column count mismatch between the dataset and the existing table. Please use Import Settings to correct the problem or upload a new file.",
        primaryAction: {
          action: dispatchHideDangerModal(dispatch),
          text: "Close"
        }
      })
    )
})

export const mergeProps = (
  stateProps,
  {
    requestImportPreviewData,
    showChangedColumnHeaders,
    showColumnCountMismatchModal
  },
  ownProps
) => {
  const { hasPreviewDataFinishedLoading, importerData, copyParams } = stateProps
  const importerDataRowSet = importerData?.row_set

  if (hasPreviewDataFinishedLoading) {
    showChangedColumnHeaders = showChangedColumnHeaders(
      createListOfColumnNameChanges(importerDataRowSet)
    )
  }

  const shouldShowChangedColumnHeaders =
    importerDataRowSet && importerDataRowSet.changed_columns.length > 0

  const isRaster = copyParams.source_type === TSourceType.RASTER_FILE

  return {
    ...stateProps,
    requestImportPreviewData,
    showChangedColumnHeaders,
    showColumnCountMismatchModal,
    ...ownProps,
    shouldShowChangedColumnHeaders,
    isRaster
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(TablePreview)
