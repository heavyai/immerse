// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen } from "@testing-library/react"
import withStoreContext from "utils/test-helpers/with-store-context"

import { mapStateToProps } from "components/sql-editor/sql-editor-data-viewer-parent"
import SqlEditorDataViewer from "components/sql-editor/sql-editor-data-viewer"

describe("SqlEditorDataViewer Component", () => {
  const props = {
    viewerHeight: 320,
    isCluster: false,
    data: {
      fields: [{ name: "test" }],
      results: ["test"]
    },
    setViewerHeight: () => {}
  }

  describe("mapStateToProps", () => {
    const state = {
      connection: {
        sessionId: "123",
        user: { url: "url" }
      }
    }

    it("should return sessionId", () => {
      const tempProps = mapStateToProps(state, {})
      expect(tempProps.sessionId).toEqual(state.connection.sessionId)
    })
  })

  describe("SqlEditorDataViewer", () => {
    it("should set the correct viewerHeight", () => {
      const storeState = {
        SqlEditorDataViewer: props,
        connection: { sessionId: "123", user: { url: "url" } }
      }
      render(withStoreContext(<SqlEditorDataViewer {...props} />, storeState))
      expect(screen.getByTestId("sql-editor-data-viewer")).toBeInTheDocument()
    })
  })
})
