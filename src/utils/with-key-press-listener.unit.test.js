// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent, screen, waitFor } from "@testing-library/react"
import withKeyPressListener from "./with-key-press-listener"

describe("withKeyPressListener HoC", () => {
  const Wrapped = () => <div data-testid="test-wrapper-div" />
  const props = { a: "b", collection: [1, 2, 3] }
  let Component
  let removeEventListenerSpy
  let addEventListener
  let listenerInner
  let listener

  beforeEach(() => {
    listenerInner = jest.fn()
    listener = jest.fn().mockImplementation(() => listenerInner)
    addEventListener = jest.spyOn(global.window, "addEventListener")
    removeEventListenerSpy = jest.spyOn(global.window, "removeEventListener")
    Component = withKeyPressListener(listener)(Wrapped)
  })

  afterEach(() => {
    removeEventListenerSpy.mockRestore()
    addEventListener.mockRestore()
  })

  it("should return a component and pass all props to it", () => {
    render(<Component {...props} />)
    expect(screen.getByTestId("test-wrapper-div")).toBeDefined()
  })

  it("should set up a keydown listener with handleKeyPress", () => {
    render(<Component {...props} />)
    expect(addEventListener).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    )
  })

  it("should call listener with correct arguments when keydown event is triggered", () => {
    render(<Component {...props} />)
    const event = new KeyboardEvent("keydown", { key: "Enter" })
    fireEvent(global.window, event)
    expect(listenerInner).toHaveBeenCalledWith(event)
  })

  it("should tear down the keydown listener with handleKeyPress when component is unmounted", async () => {
    const { unmount } = render(<Component {...props} />)

    // Wait for it to render
    await waitFor(() => {
      expect(screen.getByTestId("test-wrapper-div")).toBeDefined()
    })
    unmount()
    await waitFor(() => {
      expect(removeEventListenerSpy).toHaveBeenCalled()
    })

    // This gets called multiple times during normal component mounting/unmounting
    // just make sure it was called at least once for the keydown listener
    expect(
      removeEventListenerSpy.mock.calls.find((call) => call[0] === "keydown")
    ).toBeDefined()
  })
})
