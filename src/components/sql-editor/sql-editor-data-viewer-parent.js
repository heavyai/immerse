// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import compose from "recompose/compose"
import { connect } from "react-redux"
import mapProps from "recompose/mapProps"
import SqlEditorDataViewer from "components/sql-editor/sql-editor-data-viewer"
import withState from "recompose/withState"

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

export default compose(
  withState("viewerHeight", "setViewerHeight", DEFAULT_HEIGHT),
  connect(mapStateToProps),
  mapProps(eventHandlers)
)(SqlEditorDataViewer)
