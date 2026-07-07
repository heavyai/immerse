// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  SQLEditorExecute,
  SQLEditorStoreInput,
  SQLEditorPrivilegeError
} from "actions/sql-editor-action-creators"
import { navigateToDashboard } from "actions/dashboard-action-creators"
import { connect } from "react-redux"
import SqlEditor from "components/sql-editor/sql-editor"

export const mapStateToProps = ({
  sqlEditor: { loading, results, history, value },
  dashboard: { table },
  connection: {
    privileges: { fetchComplete, viewSqlEditor }
  }
}) => ({
  hasPrevDashboard: Boolean(table),
  loading,
  results,
  history,
  inputValue: value,
  hasSQLEditorPrivilege: viewSqlEditor,
  privilegesFetched: fetchComplete
})

export const mapDispatchToProps = (dispatch) => ({
  executeSQLStatement(query) {
    dispatch(SQLEditorExecute(query))
  },
  storeInputValue(value) {
    dispatch(SQLEditorStoreInput(value))
  },
  backToDashboard() {
    dispatch(navigateToDashboard())
  },
  triggerPrivilegeError() {
    dispatch(
      SQLEditorPrivilegeError(
        new Error('User lacks "View SQL Editor" privilege')
      )
    )
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(SqlEditor)
