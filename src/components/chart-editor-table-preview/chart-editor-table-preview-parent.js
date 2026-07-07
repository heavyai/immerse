// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import {
  getDataSourcePreview,
  getDataSourcePrivs
} from "actions/table-preview-action-creators"
import ChartEditorTablePreview from "components/chart-editor-table-preview/chart-editor-table-preview"
import { numberWithCommas } from "utils/helpers"

export const mapStateToProps = ({
  tablePreview: {
    loading,
    error,
    fields,
    rowCount,
    dataSourceDescriptor = {}
  } = {}
}) => {
  const viewSql = dataSourceDescriptor.view_sql
  const isView = Boolean(viewSql)

  return {
    loading,
    error,
    fields: Object.values(fields),
    rowCount,
    numberWithCommas,
    viewSql,
    isView
  }
}

export const mapDispatchToProps = (dispatch) => ({
  requestTablePreview(name) {
    dispatch(getDataSourcePreview(name))
    dispatch(getDataSourcePrivs(name))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartEditorTablePreview)
