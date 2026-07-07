// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import "@testing-library/jest-dom/extend-expect"
import "mutationobserver-shim"

import Services from "services/immerse"

// Mock DatabaseSwitcher globally to avoid fetch mock issues
// The component expects getDBAccessList to return an array, but global fetch returns {}
jest.mock("components/database-switcher/database-switcher", () => ({
  __esModule: true,
  default: () => null
}))

// Mock lastFilteredSize from @heavyai/charting as it's not exposed in current version
jest.mock("@heavyai/charting/src/core/core-async", () => ({
  ...(jest.requireActual("@heavyai/charting/src/core/core-async") || {}),
  lastFilteredSize: () => 100
}))

import "../src/startup"

window.APP_CONFIG = [
  {
    host: "localhost",
    url: "http://localhost:8002"
  }
]

// Mock the connector API, leaving these open ended so the
// tests themselves can setup mock implementations
// Provide default resolved values to prevent worker crashes during module initialization
Services.set("DbCon", {
  queryAsync: jest.fn().mockResolvedValue([{ val: 0 }]),
  queryDFAsync: jest.fn().mockResolvedValue({ data: [] }),
  validateQuery: jest.fn().mockResolvedValue({ status: "ok" }),
  getTablesAsync: jest.fn().mockResolvedValue([]),
  getTablesWithMetaAsync: jest.fn().mockResolvedValue([]),
  getTableEpochByNameAsync: jest.fn().mockResolvedValue(0),
  getRuntimeTableFunctionNamesAsync: jest.fn().mockResolvedValue([]),
  getTableFunctionDetailsAsync: jest.fn().mockResolvedValue([]),
  getCompletionHintsAsync: jest.fn().mockResolvedValue([]),
  getFieldsAsync: jest.fn().mockResolvedValue([]),
  createTableAsync: jest.fn().mockResolvedValue({}),
  importTableAsync: jest.fn().mockResolvedValue({ rows_completed: 0 }),
  importTableGeoAsync: jest.fn().mockResolvedValue({ rows_completed: 0 }),
  importTableStatusAsync: jest.fn().mockResolvedValue({
    rows_completed: 0,
    rows_estimated: 0,
    rows_rejected: 0
  }),
  renderVegaAsync: jest.fn().mockResolvedValue({}),
  getResultRowForPixelAsync: jest.fn().mockResolvedValue({})
})
