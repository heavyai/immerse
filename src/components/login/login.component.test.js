// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import LoginPanel from "./login-panel"

it("shows updated account values and submits the user's edits", () => {
  const connect = jest.fn()
  const props = {
    error: false,
    handleConnect: connect,
    shouldDisableDatabase: false,
    titleName: "Sign in",
    user: { username: "jim", password: "secret", database: "heavyai" }
  }
  const { rerender } = render(<LoginPanel {...props} />)
  expect(screen.getByLabelText("Username")).toHaveValue("jim")
  rerender(<LoginPanel {...props} user={{ ...props.user, username: "joe" }} />)
  expect(screen.getByLabelText("Username")).toHaveValue("joe")
  fireEvent.change(screen.getByLabelText("Username"), {
    target: { value: "edited" }
  })
  fireEvent.click(screen.getByText("CONNECT"))
  expect(connect).toHaveBeenCalledWith(
    expect.objectContaining({ username: "edited", database: "heavyai" })
  )
})
