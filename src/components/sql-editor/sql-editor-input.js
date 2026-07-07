// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { Controlled as CodeMirror } from "react-codemirror2"
import Services from "services/immerse"
import { range, sum, flatten, debounce } from "lodash"
import "codemirror/addon/hint/show-hint"
import "codemirror/addon/hint/show-hint.css"
import "codemirror/theme/monokai.css"

import {
  SQLEditorStoreCursorPosition,
  SQLEditorStoreInput
} from "actions/sql-editor-action-creators"
import { SQL_EDITOR_TEST_ID_INPUT } from "./constants"

import "./styles.scss"
import {
  isThemeDarkOrCustom,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

const mapStateToProps = ({ sqlEditor: { value, history } }) => ({
  inputValue: value,
  history
})

const mapDispatchToProps = (dispatch) => ({
  setCursorPosition(cursorPosition) {
    dispatch(SQLEditorStoreCursorPosition(cursorPosition))
  },
  storeInputValue(value) {
    dispatch(SQLEditorStoreInput(value))
  }
})

const connector = connect(mapStateToProps, mapDispatchToProps)

const SqlEditorInput = ({
  inputValue,
  storeInputValue,
  setCursorPosition,
  onEnter,
  onSelection,
  history,
  setEditor
}) => {
  const historyRef = useRef(history)
  const historyIndexRef = useRef(0)
  const inputValueRef = useRef(inputValue)
  const { theme } = useImmerseUITheme()

  useEffect(() => {
    historyRef.current = history
    // Reset history index to end whenever a query is run
    historyIndexRef.current = history.length
  }, [history])

  useEffect(() => {
    inputValueRef.current = inputValue
  }, [inputValue])

  // Alright, we generally allow navigating through query history with keyboard if:
  // 1. Input box is empty, or
  // 2. User is in the middle of navigating through history and hasn't made any changes
  // (i.e. the current input value is equal to query stored at the current history index)
  const shouldAllowKeyboardHistoryNav = () => {
    // Here's quasi-case #3: if we've just executed a query that resulted in an error, we keep it in the input box.
    // In this case, we still want to allow keyboard nav, so compare it to the last submitted query (at the previous index)
    const atEndOfHistory = historyIndexRef.current >= historyRef.current.length
    const comparisonHistoryIndex = atEndOfHistory
      ? historyIndexRef.current - 1
      : historyIndexRef.current

    return (
      historyRef.current[comparisonHistoryIndex] &&
      (inputValueRef.current === "" ||
        inputValueRef.current ===
          historyRef.current[comparisonHistoryIndex].query)
    )
  }

  const decrementHistoryIndex = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current = historyIndexRef.current - 1
      const previousHistoryItem = historyRef.current[historyIndexRef.current]
      storeInputValue(previousHistoryItem.query)
    }
  }

  const incrementHistoryIndex = () => {
    const nextHistoryItem = historyRef.current[historyIndexRef.current + 1]
    let newInputValue = ""

    if (nextHistoryItem) {
      newInputValue = nextHistoryItem.query
      historyIndexRef.current = historyIndexRef.current + 1
    } else {
      historyIndexRef.current = historyRef.current.length
    }

    storeInputValue(newInputValue)
  }

  const onKeyUp = (editor, event) => {
    if (event.key === "ArrowUp" && shouldAllowKeyboardHistoryNav()) {
      decrementHistoryIndex()
    }

    if (event.key === "ArrowDown" && shouldAllowKeyboardHistoryNav()) {
      incrementHistoryIndex()
    }
  }

  const onBeforeChange = (editor, data, val) => {
    storeInputValue(val)
  }

  // Using this instead of `onBeforeChange` because `onBeforeChange` doesn't capture
  // moving the cursor with the mouse
  const onCursorActivity = (editor) => {
    setCursorPosition(editor.getCursor())
    editor.focus()
  }
  const debouncedOnCursorActivity = debounce(onCursorActivity, 120)

  // Coerces result from connector into the format that Codemirror desires
  const formatAutoCompleteHints = (results, line, ch) => {
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

  const getAutoCompleteHints = async (editor) => {
    const query = editor.getValue()
    const doc = editor.getDoc()
    const { line, ch } = doc.getCursor()

    const results = await new Promise((resolve, reject) => {
      // Number of non line break characters above current line cursor is on
      const charsAbove = sum(
        range(0, line).map((lineNumber) => doc.getLine(lineNumber).length)
      )

      // Characters above current line + line break characters + characters before cursor in current line
      const cursor = charsAbove + line + ch

      Services.get("DbCon").getCompletionHints(
        query,
        { cursor },
        (error, result) => {
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

  const codeMirrorOptions = {
    placeholder: "Enter SQL statement...",
    lineNumbers: true,
    mode: "text/x-pgsql", // postgres-style sql syntax highlighting
    extraKeys: {
      Tab: "autocomplete",
      "Ctrl-Enter": onEnter,
      "Cmd-Enter": onEnter,
      "Shift-Enter": onEnter
    },
    hintOptions: {
      hint: getAutoCompleteHints
    },
    theme: isThemeDarkOrCustom(theme) ? "monokai" : "default"
  }

  const editorDidMount = (editor) => {
    setEditor(editor)
  }

  return (
    <div className="sql-editor__input" data-testid={SQL_EDITOR_TEST_ID_INPUT}>
      <CodeMirror
        options={codeMirrorOptions}
        value={inputValue}
        onBeforeChange={onBeforeChange}
        onSelection={onSelection}
        onKeyUp={onKeyUp}
        onCursorActivity={debouncedOnCursorActivity}
        editorDidMount={editorDidMount}
      />
    </div>
  )
}

SqlEditorInput.propTypes = {
  inputValue: PropTypes.string,
  storeInputValue: PropTypes.func,
  onEnter: PropTypes.func
}

export default connector(SqlEditorInput)
