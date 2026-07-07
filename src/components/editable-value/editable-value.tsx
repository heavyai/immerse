// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef, useState } from "react"
import cx from "classnames"
import { SourceEditIcon } from "components/svg-icons/source-edit-icon"

import "./editable-value.scss"

type Value = string | null

const EditInput = ({
  savedValue,
  onSubmitValue,
  cancelEditing,
  loading
}: {
  savedValue: Value
  onSubmitValue: (val: string) => void
  cancelEditing: () => void
  loading: boolean
}) => {
  const [value, setValue] = useState(savedValue || "")
  const textareaRef = useRef(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmitValue(value)
      e.preventDefault()
    }

    if (e.key === "Escape") {
      cancelEditing()
      e.preventDefault()
    }
  }

  useEffect(() => {
    // Autosize textarea to fit content
    if (textareaRef.current) {
      // Temporarily set height to 0 so we can get a scrollHeight, which should reflect content height
      textareaRef.current.style.height = "0px"
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${scrollHeight}px`
    }
  }, [textareaRef, value])

  return (
    <div className="edit-input">
      <textarea
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        autoFocus
        ref={textareaRef}
        rows={1}
        onBlur={() => onSubmitValue(value)}
        disabled={loading}
      />
    </div>
  )
}

export const EditableValue = ({
  savedValue,
  submitValue,
  placeholder,
  error,
  errorIcon,
  setError
}: {
  savedValue: Value | undefined
  submitValue: (value: string) => Promise<Response | { ok: boolean }>
  placeholder?: string
  error?: string
  errorIcon?: React.ReactElement
  setError: (err: string) => void
}) => {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Empty comments are returned as null from HeavyDB, so only bail on undefined
  if (savedValue === undefined) {
    return <div />
  }

  const onSubmitValue = async (value: string) => {
    setLoading(true)
    const res = await submitValue(value)
    if (res.ok) {
      setEditing(false)
    }
    setLoading(false)
  }

  const cancelEditing = () => {
    setError("")
    setEditing(false)
  }

  return (
    <div
      className={cx("editable-value", {
        "editable-value--editing": editing,
        "editable-value--error": error
      })}
    >
      <div
        className="editable-value__click-target"
        onClick={() => setEditing(true)}
      >
        {editing || error ? (
          <>
            {error && errorIcon}
            <EditInput
              savedValue={savedValue}
              onSubmitValue={onSubmitValue}
              cancelEditing={cancelEditing}
              loading={loading}
            />
          </>
        ) : (
          <>
            <div className="editable-value__left-group">
              <div
                className="editable-value__view"
                title={savedValue || undefined}
              >
                {savedValue || placeholder}
              </div>
            </div>
          </>
        )}
        <div
          className={cx("editable-value__edit-icon", {
            "editable-value__edit-icon--visible": !savedValue && placeholder
          })}
        >
          <SourceEditIcon />
        </div>
      </div>
    </div>
  )
}
