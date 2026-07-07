// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Controlled as CodeMirror } from "react-codemirror2"
import Services from "services/immerse"
import { range, sum, flatten } from "lodash"
import "codemirror/addon/hint/show-hint"
import "codemirror/addon/hint/show-hint.css"
import "codemirror/theme/monokai.css"
import * as codemirror from "codemirror"

import "./sql-notebook-editor.scss"
import {
  isThemeDarkOrCustom,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

type AutoCompleteHint = { hints: String[]; replaced: String }
type AutoCompleteHints = Array<AutoCompleteHint>
// Coerces result from connector into the format that Codemirror desires
const formatAutoCompleteHints = (
  results: AutoCompleteHints,
  line: number,
  ch: number
) => {
  const list = flatten(results.map((result) => result.hints))
  const fromChar = results[0] ? ch - results[0].replaced.length : ch

  // From/to are the start and end cursor positions of the word being autocompleted/replaced
  return {
    list,
    from: {
      line,
      ch: fromChar
    },
    to: {
      line,
      ch
    }
  }
}

const getAutoCompleteHints = async (editor: codemirror.Editor) => {
  const query = editor.getValue()
  const doc = editor.getDoc()
  const { line, ch } = doc.getCursor()

  const results: AutoCompleteHints = await new Promise((resolve, reject) => {
    // Number of non line break characters above current line cursor is on
    const charsAbove = sum(
      range(0, line).map((lineNumber) => doc.getLine(lineNumber).length)
    )

    // Characters above current line + line break characters + characters before cursor in current line
    const cursor = charsAbove + line + ch

    Services.get("DbCon").getCompletionHints(
      query,
      { cursor },
      (error: Error, result: AutoCompleteHints) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
  })

  return formatAutoCompleteHints(results, line, ch)
}

// Code editor
type SqlNotebookEditorProps = {
  inputValue: string
  storeInputValue: (s: string) => void
  onEnter: (editor: codemirror.Editor) => void
  setIsFocused: (isFocused: boolean) => void
  setActiveEditor?: (editor: codemirror.Editor) => void
  onFocus?: (editor: codemirror.Editor) => void
  onEscape?: () => void
  isReadOnly?: boolean
  onSelection?: (editor: any) => void
  lineWrapping?: boolean
  autofocus?: boolean
}
export const SqlNotebookEditor = ({
  inputValue,
  storeInputValue,
  onEnter,
  onSelection = () => {},
  onFocus = (editor) => {
    editor.focus()
  },
  onEscape = () => {},
  setActiveEditor,
  setIsFocused,
  isReadOnly = false,
  lineWrapping = false,
  autofocus = true
}: SqlNotebookEditorProps) => {
  const onBeforeChange = (
    _editor: codemirror.Editor,
    _data: any,
    val: string
  ) => {
    storeInputValue(val)
  }

  const { theme } = useImmerseUITheme()
  const codeMirrorOptions = {
    readOnly: isReadOnly,
    placeholder: "Enter SQL statement...",
    lineNumbers: true,
    mode: "text/x-pgsql", // postgres-style sql syntax highlighting
    extraKeys: {
      Tab: "autocomplete",
      "Ctrl-Enter": onEnter,
      "Cmd-Enter": onEnter,
      "Shift-Enter": onEnter,
      Esc: onEscape
    },
    autofocus,
    hintOptions: {
      hint: getAutoCompleteHints
    },
    theme: isThemeDarkOrCustom(theme) ? "monokai" : "default",
    viewportMargin: 22,
    lineWrapping
  }

  const editorDidMount = (editor: codemirror.Editor) => {
    setActiveEditor(editor)
  }

  const onEditorFocus = (editor: codemirror.Editor) => {
    setActiveEditor(editor)
    onFocus(editor)
    if (setIsFocused) {
      setIsFocused(true)
    }
  }

  const onEditorUnfocus = () => {
    if (setIsFocused) {
      setIsFocused(false)
    }
  }

  return (
    <div className="sql-notebook-editor">
      <CodeMirror
        options={codeMirrorOptions}
        value={inputValue}
        onBeforeChange={onBeforeChange}
        onSelection={onSelection}
        onFocus={onEditorFocus}
        onBlur={onEditorUnfocus}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}
