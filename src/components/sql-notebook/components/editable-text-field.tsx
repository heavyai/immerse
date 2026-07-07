// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react"
import { TextField } from "@rmwc/textfield"

import "./editable-text-field.scss"
import { BUTTON_TYPES, Button } from "./button"
import classNames from "classnames"
import { useInputKeyboardControls } from "../hooks/useInputKeyboardControls"
import { EditingIconBadge } from "./editing-icon-badge"
import { IconEdit } from "components/svg-icons/icon-edit"

type EditableTextFieldProps = {
  text: string | undefined
  onSubmit: (v: string) => void
  onEdit?: (editing: boolean) => void
  submitOnEnter?: boolean
}

export const EditableTextField = forwardRef(
  ({ text, onSubmit, onEdit, submitOnEnter }: EditableTextFieldProps, ref) => {
    const [editing, setEditing] = useState(false)
    const [editedText, setEditedText] = useState(text)

    useImperativeHandle(
      ref,
      () => {
        return {
          stopEditing() {
            setEditing(false)
          },
          startEditing() {
            setEditing(true)
          }
        }
      },
      []
    )

    const submit = () => {
      if (text !== editedText) {
        onSubmit(editedText)
      }
      setEditing(false)
      onEdit?.(false)
    }

    const cancel = (clearEdits = true) => {
      if (clearEdits) {
        setEditedText(text)
      }
      setEditing(false)
      onEdit?.(false)
    }

    const keyboardControlProps = useInputKeyboardControls<HTMLTextAreaElement>(
      submit,
      cancel,
      submitOnEnter
    )
    const { inputRef } = keyboardControlProps

    useEffect(() => {
      // Focuses cursor at the end of the textarea when user starts editing
      const focusAtEnd = () => {
        const input = inputRef.current
        if (input) {
          input.focus()
          const end = input.value?.length ?? 0
          input.selectionStart = end
          input.selectionEnd = end
        }
      }
      if (editing && inputRef.current) {
        focusAtEnd()
      }
    }, [editing, inputRef])

    return (
      <div className={classNames("editable-text-field", { editing })}>
        {editing ? (
          <div className="editable-text-field__editor">
            <TextField
              className="editable-text-field__input"
              textarea
              value={editedText}
              onChange={(e) => {
                setEditedText(e.target.value)
              }}
              autoFocus
              {...keyboardControlProps}
            >
              <EditingIconBadge />
            </TextField>

            <div className="editing-actions">
              <Button
                outlined
                label={"Cancel"}
                onClick={() => {
                  setEditedText(text)
                  setEditing(false)
                  onEdit?.(false)
                }}
              />
              <Button
                type={BUTTON_TYPES.SECONDARY}
                label={"Regenerate"}
                onClick={submit}
                disabled={text === editedText}
              />
            </div>
          </div>
        ) : (
          <div
            className="editable-text-field__display"
            onClick={() => {
              setEditing(true)
              onEdit?.(true)
            }}
          >
            <div>{text}</div>
            <div className="edit-icon">
              <IconEdit />
            </div>
          </div>
        )}
      </div>
    )
  }
)
