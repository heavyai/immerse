// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { StrictMode } from "react"
import { render, act } from "@testing-library/react"
import { MeasuredContainer } from "./use-element-size"

it("measures changes, disconnects through strict replay and ignores queued notifications after unmount", () => {
  const original = global.ResizeObserver
  const observers = []
  global.ResizeObserver = class {
    constructor(callback) {
      this.callback = callback
      this.disconnect = jest.fn()
      observers.push(this)
    }
    observe() {}
  }
  let width = 400
  const bounds = jest
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(() => ({ width, height: 300 }))
  const onResize = jest.fn()
  try {
    const { getByText, unmount } = render(
      <StrictMode>
        <MeasuredContainer onResize={onResize}>
          {({ size }) => <span>{size.width}</span>}
        </MeasuredContainer>
      </StrictMode>
    )
    expect(getByText("400")).toBeInTheDocument()
    width = 600
    act(() => observers.at(-1).callback())
    expect(getByText("600")).toBeInTheDocument()
    unmount()
    const count = onResize.mock.calls.length
    observers.forEach((observer) => {
      expect(observer.disconnect).toHaveBeenCalled()
      observer.callback()
    })
    expect(onResize).toHaveBeenCalledTimes(count)
  } finally {
    bounds.mockRestore()
    global.ResizeObserver = original
  }
})
