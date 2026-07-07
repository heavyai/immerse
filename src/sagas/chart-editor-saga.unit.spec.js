// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { testSaga } from "redux-saga-test-plan"
import { handleTablePreview } from "./chart-editor-saga"
import { setChartEditorTablePreview } from "actions/chart-editor-action-creators"
import { delay } from "redux-saga"

describe("chart editor saga", () => {
  describe("handleTablePreview", () => {
    it("should delay table preview request", () => {
      const tableName = "flights"
      const saga = testSaga(handleTablePreview, { tableName })
      return saga
        .next()
        .next()
        .put(setChartEditorTablePreview(tableName))
    })
  })
})
