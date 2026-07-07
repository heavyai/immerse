// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import Quill from "quill-next"
import { htmlEditButton } from "./html-editor"
import sanitizeHtml from "sanitize-html"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
import "./styles.scss"
import { sanitizeOpts } from "./sanitize-opts"

const { HTML_EDITOR } = available_feature_flags

export default class TextComponent extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    isEditable: PropTypes.bool.isRequired,
    updateText: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    wasApplied: PropTypes.bool.isRequired,
    wasCancelled: PropTypes.bool.isRequired,
    fontColorPalette: PropTypes.array.isRequired
  }

  state = {
    html: ""
  }

  componentDidMount() {
    this.setUpEditor()
  }

  UNSAFE_componentWillUpdate(nextProps) {
    let text = sanitizeHtml(nextProps.text, sanitizeOpts)
    if (nextProps.isEditable !== this.props.isEditable) {
      this.toggleToolbarVisibility(nextProps.isEditable)
      if (nextProps.isEditable) {
        this.cacheHtml()
      } else if (nextProps.wasCancelled) {
        this.revertHtml()
      } else {
        text = this.getHtml()
        this.saveHtml()
      }
      this.setHtml(nextProps.isEditable ? text : process(text))
    }
  }

  componentWillUnmount() {
    this.destroyEditor()
  }

  setUpEditor = () => {
    // Import the link from Quill so you can override it
    const Link = Quill.import("formats/link")
    // Extend the link so that you can figure out if the value has a properly formed
    // link (http:// or https:// or mailto:)
    // https://quilljs.com/docs/modules/toolbar/
    class MyLink extends Link {
      static create(value) {
        const node = super.create(value)
        value = this.sanitize(value)
        const hasHref =
          value.includes("http://") ||
          value.includes("https://") ||
          value.includes("mailto:")
        // If not properly formed, correct the link so that it contains http.
        if (!hasHref) {
          node.setAttribute("href", `http://${value}`)
        }
        return node
      }
    }

    const Font = Quill.import("formats/font")
    Font.whitelist = ["roboto", "arial", "mono"]
    Quill.register(Font, true)

    const fontSizeArr = [
      "8px",
      "9px",
      "10px",
      "12px",
      "14px",
      "18px",
      "24px",
      "30px",
      "36px",
      "48px",
      "60px",
      "72px",
      "96px"
    ]
    const Size = Quill.import("attributors/style/size")
    Size.whitelist = fontSizeArr
    Quill.register(Size, true)

    const colors = this.props.fontColorPalette

    Quill.register(MyLink)
    const toolbarOptions = [
      [
        { font: ["roboto", "arial", "mono"] },
        { size: fontSizeArr },
        { header: [1, 2, 3, false] },
        "bold",
        "italic",
        "underline",
        "strike"
      ],
      [{ color: colors }, { background: colors }],
      [{ list: "ordered" }, { list: "bullet" }, { align: [] }],
      ["link", "image"],
      ["blockquote", "code-block", "clean"]
    ]
    const options = {
      modules: {
        toolbar: toolbarOptions
      },
      placeholder: "",
      theme: "snow"
    }

    const enableHTMLEditor = getFeatureFlag(HTML_EDITOR)

    if (enableHTMLEditor) {
      Quill.register({
        "modules/htmlEditButton": htmlEditButton
      })
      options.modules.htmlEditButton = {
        msg: "Edit HTML source"
      }
    }

    this.textEditor = new Quill(this.textEditorRef, options)
    this.setHtml(
      this.props.isEditable ? this.props.text : process(this.props.text)
    )
    this.cacheHtml()
    this.toggleToolbarVisibility(this.props.isEditable)
  }

  setHtml = (html) => {
    this.getEditorNode().innerHTML = sanitizeHtml(html, sanitizeOpts)
  }

  cacheHtml = () => {
    this.setState({ html: this.getHtml() })
  }

  toggleToolbarVisibility = (shouldBeVisible) => {
    const classList = this.textEditor.getModule("toolbar").container.classList
    if (shouldBeVisible) {
      classList.remove("hidden")
    } else {
      classList.add("hidden")
    }

    this.textEditor.enable(shouldBeVisible)
    this.getEditorNode().scrollTop = 0
    if (shouldBeVisible) {
      this.textEditor.focus()
    }
  }

  destroyEditor = () => {
    this.textEditor = null
    this.textEditorRef.innerHTML = null
  }

  setupTextEditorRef = (node) => {
    this.textEditorRef = node
  }

  getEditorNode = () => this.textEditor.container.querySelector(".ql-editor")

  getHtml = () => sanitizeHtml(this.getEditorNode().innerHTML, sanitizeOpts)

  saveHtml = () => {
    this.props.updateText(
      sanitizeHtml(this.getHtml(), sanitizeOpts),
      this.props.id
    )
  }

  revertHtml = () => {
    this.setHtml(this.state.html)
    this.props.updateText(
      sanitizeHtml(this.state.html, sanitizeOpts),
      this.props.id
    )
  }

  render() {
    return (
      <div
        className="chart-container chart-type-text"
        id={`chart${this.props.id}`}
      >
        <div ref={this.setupTextEditorRef} />
      </div>
    )
  }
}
