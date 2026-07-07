// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// We are sharing these consts with SQL editor's UI tests rather than directly
// importing from the source files to avoid an issue where getFeatureFlags will
// assume it's being run from the context of a browser.
//
// See thread in: https://heavyai.slack.com/archives/G011009QDPD/p1587402276219500
export const SQL_EDITOR_TEST_ID_INPUT = "sql-editor-input"
export const SQL_EDITOR_TEST_ID_RUN_BUTTON = "sql-editor-run-button"
export const SQL_EDITOR_TEST_ID_TABLE_BROWSER_TAB =
  "sql-editor-table-browser-tab"
export const SQL_EDITOR_TEST_ID_QUERY_HISTORY_TAB =
  "sql-editor-query-history-tab"
export const SQL_EDITOR_TEST_ID_TABLE_BROWSER =
  "sql-editor-table-browser-tab-content"
export const SQL_EDITOR_TEST_ID_TABLE_BROWSER_SEARCH =
  "sql-editor-table-browser-search"
export const SQL_EDITOR_TEST_ID_QUERY_HISTORY =
  "sql-editor-query-history-tab-content"
export const SQL_EDITOR_TEST_ID_RESULTS_META = "sql-editor-results-meta"
export const SQL_EDITOR_TEST_ID_QUERY_INFO = "sql-editor-selected-query-info"
export const SQL_EDITOR_TEST_ID_QUERY_HISTORY_ITEM =
  "sql-editor-query-history-item"
export const SQL_EDITOR_TEST_ID_SNIPPETS_HEADER = "sql-editor-snippets-header"
