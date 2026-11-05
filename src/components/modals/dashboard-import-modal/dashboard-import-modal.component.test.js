// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import DashboardImportModal from "./dashboard-import-modal"
import {
  IMPORT_READY_MESSAGE,
  PRIMARY_BUTTON_TEXT
} from "constants/dashboard-import-modal"

it("imports the existing three-line dashboard file without changing its metadata or state payloads", async () => {
  const importDashboard = jest.fn()
  const hideModal = jest.fn()
  render(
    <DashboardImportModal
      importDashboard={importDashboard}
      hideModal={hideModal}
    />
  )
  const metadata = { table: ["sales"], version: "8.0", opaque: "keep" }
  const state = { charts: {}, opaque: { plugin: [1, 2] } }
  const file = new File(
    [`Example\r\n${JSON.stringify(metadata)}\r\n${JSON.stringify(state)}`],
    "dashboard.json",
    { type: "application/json" }
  )
  const input = document.querySelector('input[type="file"]')
  fireEvent.change(input, { target: { files: [file] } })
  await waitFor(() =>
    expect(screen.getByText(IMPORT_READY_MESSAGE)).toBeInTheDocument()
  )
  fireEvent.click(screen.getByRole("button", { name: PRIMARY_BUTTON_TEXT }))
  expect(importDashboard).toHaveBeenCalledWith(
    "Example",
    JSON.stringify(metadata),
    JSON.stringify(state)
  )
  expect(hideModal).toHaveBeenCalledTimes(1)
})
