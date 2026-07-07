// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, fireEvent } from "@testing-library/react"

import Popover, { TargetedPopover } from "./popover"

describe("Popover Component", () => {
  function renderPopover(props) {
    return render(
      <div>
        <div className="click-me" />
        <Popover {...props}>
          <div className="hey-dude">hey</div>
        </Popover>
      </div>
    )
  }

  function renderTargetedPopover(props) {
    return render(
      <div>
        <div className="click-me" />
        <TargetedPopover {...props}>
          <div className="hey-dude">hey</div>
        </TargetedPopover>
      </div>
    )
  }

  it("should not render anything if isOpened is false", () => {
    const { container } = renderPopover({ isOpened: false, onClose: () => {} })
    expect(container.querySelectorAll(".hey-dude")).toHaveLength(0)
  })

  it("should render its child if isOpened is true", () => {
    const { container } = renderPopover({ isOpened: true, onClose: () => {} })
    expect(container.querySelectorAll(".hey-dude")).toHaveLength(1)
  })

  it("should run the onClose prop when an element is clicked outside of it", () => {
    const onClose = jest.fn()
    render(
      <Popover isOpened onClose={onClose}>
        required child
      </Popover>
    )

    const outside = document.createElement("div")
    document.body.appendChild(outside)

    fireEvent.mouseDown(outside, { button: 0, target: outside })

    expect(onClose).toHaveBeenCalled()
  })

  it("should not run the onClose prop when an element is clicked inside of it", () => {
    const onClose = jest.fn()
    const { getByText } = render(
      <Popover isOpened onClose={onClose}>
        <button type="button">inside</button>
      </Popover>
    )

    const inside = getByText("inside")
    fireEvent.mouseDown(inside, { button: 0, target: inside })

    expect(onClose).not.toHaveBeenCalled()
  })

  it("should trigger keydown handler if exists", () => {
    const onKeyDown = jest.fn()
    render(
      <Popover isOpened onClose={() => {}}>
        <div>child</div>
      </Popover>
    )

    fireEvent.keyDown(document, { key: "Enter", keyCode: 13 })

    // Popover.handleKeyDown just forwards the event to props.onKeyDown
    // when provided
    render(
      <Popover isOpened onKeyDown={onKeyDown} onClose={() => {}}>
        <div>child</div>
      </Popover>
    )

    fireEvent.keyDown(document, { key: "A", keyCode: 65 })
    expect(onKeyDown).toHaveBeenCalled()
  })

  it("should position popup if has offsets", () => {
    const { container } = renderTargetedPopover({
      isOpened: true,
      overflowWidth: 32,
      onClose: () => {},
      target: {
        getBoundingClientRect: () => ({ left: 20 }),
        offsetTop: 10,
        offsetLeft: 40
      }
    })

    const popoverDiv = container.querySelector(".react-popover")
    expect(popoverDiv.style.position).toBe("absolute")
    expect(popoverDiv.style.marginTop).toBe("10px")
    expect(popoverDiv.style.left).toBe("20px")

    const { container: container2 } = renderTargetedPopover({
      isOpened: true,
      overflowWidth: 0,
      onClose: () => {},
      target: {
        getBoundingClientRect: () => ({ left: 30 }),
        offsetTop: 15,
        offsetLeft: 40
      }
    })

    const popoverDiv2 = container2.querySelector(".react-popover")
    expect(popoverDiv2.style.position).toBe("absolute")
    expect(popoverDiv2.style.marginTop).toBe("15px")
    expect(popoverDiv2.style.left).toBe("30px")
  })
})
