// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import SqlEditorDataTable from "components/sql-editor/sql-editor-data-table"

SqlEditorDataViewer.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object]),
  isCluster: PropTypes.bool,
  setViewerHeight: PropTypes.func.isRequired,
  viewerHeight: PropTypes.number.isRequired,
  selectedColumnIndex: PropTypes.number,
  shouldAdjustColWidth: PropTypes.bool,
  maxColWidth: PropTypes.number,
  minColWidth: PropTypes.number
}

export default function SqlEditorDataViewer(props) {
  // TODO: Git blame me and revert me to restore download CSV.
  // TODO: Also Git blame me (removing all other download CSV cruft)
  // Right now it's completely broken because the new webserver doesn't have
  // a /downloads endpoint, and anyway we've de-prioritized this feature while
  // we figure out requirements.
  // FE-10540
  return (
    <div
      data-testid="sql-editor-data-viewer"
      className="sql-editor-data-viewer"
      style={{ height: `${props.viewerHeight}px` }}
    >
      <div className="sql-editor-data-viewer-window">
        <SqlEditorDataTable {...props} />
      </div>
    </div>
  )
}
