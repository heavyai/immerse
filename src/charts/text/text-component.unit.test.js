// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { render, cleanup } from "@testing-library/react"

import TextComponent from "./text-component"

describe("Text widget", () => {
  window.document.getSelection = jest.fn()
  let fixture = null
  let view = null
  afterEach(cleanup)
  beforeEach(() => {
    document.querySelector("body").innerHTML = '<div id="chart"></div>'
    fixture = document.querySelector("#chart")
    view = null
  })

  function mountComponent(givenProps) {
    const props = {
      id: "0",
      updateText: () => {},
      text: "test-text",
      wasApplied: false,
      wasCancelled: false,
      isEditable: false,
      ...givenProps
    }

    if (view) {
      view.rerender(<TextComponent {...props} />)
    } else {
      view = render(<TextComponent {...props} />, { container: fixture })
    }
  }

  it("should work without props, default to showing blank editor", () => {
    mountComponent({ isEditable: false })

    const editor = fixture.querySelector(".ql-editor")
    const toolbar = fixture.querySelector(".ql-toolbar")
    expect(editor).toBeTruthy()
    expect(toolbar.classList.contains("hidden")).toBeTruthy()
    expect(editor.innerHTML).toEqual("test-text")
  })

  it("switches to edit mode", () => {
    mountComponent({ isEditable: true })

    const toolbar = fixture.querySelector(".ql-toolbar")
    expect(toolbar).toBeTruthy()
    expect(toolbar.classList.contains("hidden")).toBeFalsy()
  })

  it("shows data passed as html", () => {
    mountComponent({ text: "<p>foo</p>" })

    const editor = fixture.querySelector(".ql-editor")
    expect(editor.innerHTML).toEqual("<p>foo</p>")
  })

  it("saves data before switching to non-editable", (done) => {
    mountComponent({
      isEditable: true,
      id: "1",
      text: "<p>foo</p>",
      updateText: (html, id) => {
        expect(html).toEqual("<p>foo</p>")
        expect(id).toEqual("1")
        done()
      },
      wasApplied: false,
      wasCancelled: false
    })

    mountComponent({
      isEditable: false,
      id: "1",
      text: "<p>foo</p>",
      updateText: () => {},
      wasApplied: false,
      wasCancelled: false
    })
  })
})
