// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { all, put, takeLatest } from "redux-saga/effects"
import { delay } from "redux-saga"
import { INIT_CHART_EDITOR_TABLE_PREVIEW } from "constants/action-types"
import { setChartEditorTablePreview } from "actions/chart-editor-action-creators"

const HOVER_DELAY = 500

export function* handleTablePreview(action) {
  yield delay(HOVER_DELAY)
  yield put(setChartEditorTablePreview(action.tableName))
}

export default function* chartEditorSaga() {
  yield all([takeLatest(INIT_CHART_EDITOR_TABLE_PREVIEW, handleTablePreview)])
}
