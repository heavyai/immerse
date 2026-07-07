// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type QueryHistory = {
  isVega: boolean
  query: string
  results?: any
  error?: string
  timestamp: number
}

// Possibly incomplete; SQL editor reducer not converted to TS
export type SqlEditorState = {
  loading: boolean
  results: null | any
  value: string
  history: QueryHistory[]
  loadingHistory: boolean
  loadedHistory: boolean
}
