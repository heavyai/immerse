// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import Table from "./table"
import {
  updateColumnComment,
  updateColumnType
} from "actions/importer-action-creators"

export const mapStateToProps = ({
  importer,
  tablePreview: { fields: destTableFields = {}, tableDetails }
}) => ({
  incomingFields: importer.data.row_set.row_desc,
  rows: importer.data.row_set.rows,
  destTableFields: Object.values(destTableFields),
  existingColumnComments: tableDetails?.row_desc.map((row) => row.comment),
  columnComments: importer.columnComments
})

export const mapDispatchToProps = (dispatch) => ({
  handleUpdateDataType(columnId) {
    return (newDataType) => dispatch(updateColumnType(newDataType, columnId))
  },
  updateColumnComment(columnIndex, comment) {
    dispatch(updateColumnComment(columnIndex, comment))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Table)
