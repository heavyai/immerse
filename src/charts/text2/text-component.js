// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { useChart } from "charts/utils/hooks"

import SunEditor from "suneditor-react"
import "suneditor/dist/css/suneditor.min.css"
import "./styles.scss"

export default function Text2Component({ id, isEditable, updateText, text }) {
  const chart = useChart(id)
  const colors = chart.color.val

  const handleEditorChange = (content) => {
    updateText(content, id)
  }

  return (
    <div className="sun-editor-wrapper">
      <SunEditor
        setContents={text}
        hideToolbar={!isEditable}
        onChange={handleEditorChange}
        readOnly={!isEditable}
        setOptions={{
          iframeCSSFileName:
            "https://cdn.jsdelivr.net/npm/suneditor@2.44.3/dist/css/suneditor.min.css",
          iframe: true,
          iframeAttributes: {
            scrolling: "no",
            sandbox: " "
          },
          defaultStyle: "height: 100%",
          resizingBar: false,
          colorList: [colors],
          font: ["Arial", "Roboto", "Courier New", "Times"],
          buttonList: [
            [
              "undo",
              "redo",
              "font",
              "fontSize",
              "formatBlock",
              "bold",
              "underline",
              "italic",
              "strike",
              "fontColor",
              "hiliteColor",
              "removeFormat",
              "align",
              "horizontalRule",
              "list",
              "lineHeight",
              "table",
              "link",
              "image",
              "codeView"
            ]
          ]
        }}
      />
    </div>
  )
}
