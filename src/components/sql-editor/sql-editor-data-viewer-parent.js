// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { connect } from "react-redux"
import SqlEditorDataViewer from "components/sql-editor/sql-editor-data-viewer"

const DEFAULT_HEIGHT = 320

const generateURL = ({ protocol, host, port }) => `${protocol}//${host}:${port}`

export const mapStateToProps = (
  { connection: { sessionId, user, isCluster } },
  ownProps
) => ({
  url: generateURL(user),
  // TODO: Because old SQL editor is still using this component, we need to
  // account for both cases of the dynamic height set in the new editor and
  // the static fixed height of the old one
  viewerHeight: ownProps.dataViewerHeight || ownProps.viewerHeight,
  sessionId,
  isCluster
})

const eventHandlers = ({ query, queryId, sessionId, url, ...rest }) => ({
  queryId,
  ...rest
})

function useSqlEditorDataViewerParentProps(incomingProps) {
  let viewProps = incomingProps
  viewProps = eventHandlers(viewProps)
  return viewProps
}

function StatefulSqlEditorDataViewerParent(incomingProps) {
  const viewProps = useSqlEditorDataViewerParentProps(incomingProps)
  return React.createElement(SqlEditorDataViewer, viewProps)
}

const ConnectedSqlEditorDataViewerParent = connect(mapStateToProps)(
  StatefulSqlEditorDataViewerParent
)

function useSqlEditorDataViewerParentProps3(incomingProps) {
  let viewProps = incomingProps
  const [viewerHeight, setViewerHeight] = React.useState(() =>
    DEFAULT_HEIGHT(viewProps)
  )
  viewProps = { ...viewProps, viewerHeight, setViewerHeight }
  return viewProps
}

function SqlEditorDataViewerParentWithState3(incomingProps) {
  const viewProps = useSqlEditorDataViewerParentProps3(incomingProps)
  return React.createElement(ConnectedSqlEditorDataViewerParent, viewProps)
}

export default SqlEditorDataViewerParentWithState3
