// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react"
import PropTypes from "prop-types"

import SqlEditorContent from "components/sql-editor/sql-editor-content"

const SqlEditor = ({
  hasPrevDashboard,
  backToDashboard,
  history,
  executeSQLStatement,
  inputValue,
  loading,
  storeInputValue,
  hasSQLEditorPrivilege,
  privilegesFetched,
  triggerPrivilegeError
}) => {
  const sortedHistory = useMemo(
    // Could technically get out of order if user manages to execute a query before
    // previous session history is loaded
    () => history.slice().sort((a, b) => a.timestamp - b.timestamp),
    [history]
  )

  if (privilegesFetched && !hasSQLEditorPrivilege) {
    triggerPrivilegeError()
  }

  return privilegesFetched && hasSQLEditorPrivilege ? (
    <div className="sql-editor">
      <SqlEditorContent
        executeSQLStatement={executeSQLStatement}
        history={sortedHistory}
        loading={loading}
        storeInputValue={storeInputValue}
        inputValue={inputValue}
        hasPrevDashboard={hasPrevDashboard}
        backToDashboard={backToDashboard}
      />
    </div>
  ) : null
}

SqlEditor.propTypes = {
  backToDashboard: PropTypes.func.isRequired,
  executeSQLStatement: PropTypes.func.isRequired,
  hasPrevDashboard: PropTypes.bool.isRequired,
  history: PropTypes.oneOfType([PropTypes.array]),
  inputValue: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  storeInputValue: PropTypes.func.isRequired,
  hasSQLEditorPrivilege: PropTypes.bool
}

export default SqlEditor
