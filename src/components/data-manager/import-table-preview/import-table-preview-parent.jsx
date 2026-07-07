// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import {
  updateTableName,
  getImportPreviewData,
  toggleImportSettingsModal
} from "actions/importer-action-creators"
import ImportTablePreview from "./import-table-preview"

export const mapStateToProps = ({ importer }) => {
  return {
    importerData: importer.data,
    tableName: importer.tablename
  }
}

const mapDispatchToProps = (dispatch) => ({
  requestImportPreviewDataInternal: ({ appendTableName }) => {
    dispatch(getImportPreviewData(appendTableName))
  },
  updateTableName(newTableName) {
    dispatch(updateTableName(newTableName))
  },
  toggleImportSettingsModal(show) {
    dispatch(toggleImportSettingsModal(show))
  }
})

const mergeProps = (stateProps, dispatchProps) => ({
  ...stateProps,
  ...dispatchProps,
  requestImportPreviewData: () => {
    dispatchProps.requestImportPreviewDataInternal(stateProps)
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ImportTablePreview)
