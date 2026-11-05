// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** @jest-environment jsdom */
const React = require("react")
const {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor
} = require("@testing-library/react")
const {
  Checkbox,
  Switch,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuSurfaceAnchor,
  Menu,
  MenuItem,
  Tooltip
} = require("./index")
const h = React.createElement
afterEach(cleanup)

it("exposes native checked, mixed and disabled controls with labels", () => {
  const change = jest.fn()
  const { rerender } = render(
    h(Checkbox, {
      label: "Include nulls",
      checked: false,
      onChange: change,
      indeterminate: true
    })
  )
  expect(screen.getByRole("checkbox").indeterminate).toBe(true)
  fireEvent.click(screen.getByLabelText("Include nulls"))
  expect(change).toHaveBeenCalledTimes(1)
  rerender(
    h(Switch, {
      label: "Show legend",
      checked: true,
      disabled: true,
      onChange: change
    })
  )
  expect(screen.getByRole("switch").checked).toBe(true)
  expect(screen.getByRole("switch").disabled).toBe(true)
})
it("changes a range with keyboard input and commits its value", () => {
  const change = jest.fn()
  const commit = jest.fn()
  render(
    h(Slider, {
      defaultValue: [2, 8],
      min: 0,
      max: 10,
      onChange: change,
      onChangeCommitted: commit
    })
  )
  fireEvent.keyDown(screen.getByRole("slider", { name: "Minimum" }), {
    key: "ArrowRight"
  })
  expect(change).toHaveBeenCalledWith(null, [3, 8])
  expect(commit).toHaveBeenCalledWith(null, [3, 8])
})
it("portals a labelled modal, focuses its controls, and dismisses on Escape", async () => {
  const close = jest.fn()
  const { unmount } = render(
    h(
      Dialog,
      { open: true, onClose: close },
      h(DialogTitle, null, "Export chart"),
      h(DialogContent, null, h("button", null, "Download"))
    )
  )
  expect(screen.getByRole("dialog", { name: "Export chart" })).toBeTruthy()
  await waitFor(() =>
    expect(document.activeElement.textContent).toBe("Download")
  )
  fireEvent.keyDown(document.activeElement, { key: "Escape" })
  expect(close).toHaveBeenCalledTimes(1)
  unmount()
  expect(screen.queryByRole("dialog")).toBeNull()
  expect(document.body.style.pointerEvents).not.toBe("none")
})
it("moves menu focus past disabled items and invokes a selected item once", () => {
  const select = jest.fn()
  const close = jest.fn()
  render(
    h(
      MenuSurfaceAnchor,
      null,
      h("button", null, "Options"),
      h(
        Menu,
        { open: true, onClose: close },
        h(MenuItem, { disabled: true }, "Unavailable"),
        h(MenuItem, { onClick: select }, "Export"),
        h(MenuItem, null, "Delete")
      )
    )
  )
  const item = screen.getByRole("menuitem", { name: "Export" })
  item.focus()
  fireEvent.keyDown(item, { key: "ArrowDown" })
  expect(document.activeElement.textContent).toBe("Delete")
  fireEvent.click(item)
  expect(select).toHaveBeenCalledTimes(1)
  expect(close).toHaveBeenCalledTimes(1)
})
it("shows tooltip content to keyboard users and removes its portal on unmount", async () => {
  const { unmount } = render(
    h(
      Tooltip,
      { content: "Chart settings", enterDelay: 0 },
      h("button", null, "Settings")
    )
  )
  fireEvent.focus(screen.getByText("Settings").parentElement)
  await waitFor(() =>
    expect(screen.getByRole("tooltip").textContent).toBe("Chart settings")
  )
  unmount()
  expect(screen.queryByRole("tooltip")).toBeNull()
})
