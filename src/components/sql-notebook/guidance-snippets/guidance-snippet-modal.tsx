// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import moment from "moment/moment"

import { Tooltip } from "@rmwc/tooltip"
import { SimpleDialog } from "widgets/dialog/Dialog"
import { TextField } from "widgets/text-field/TextField"
import IconPlus from "components/svg-icons/icon-plus"
import { IconInfoOutline } from "components/svg-icons/icon-info-outline"
import { IconDelete } from "components/svg-icons/icon-delete"

import { SnippetTipsPopover } from "./snippets-tips-popover"
import {
  sqlNotebookInsertGuidanceSnippets,
  sqlNotebookUpdateGuidanceSnippetThunk
} from "../redux/sql-notebook-action-creators"

import { MAX_SNIPPET_CHARACTER_LENGTH } from "../constants"
import "./guidance-snippet-modal.scss"
import { BUTTON_TYPES, Button } from "../components/button"
import { GuidanceSnippetTimestamp } from "./guidance-snippet-timestamp"
import { useIsGuidanceSnippetEditor } from "../hooks/useIsGuidanceSnippetEditor"
import { AppState } from "vega/charts/types"

const MAX_SNIPPET_INPUTS = 20

const SnippetInput = ({
  snippet,
  index,
  snippets,
  onUpdate,
  onDelete
}: {
  snippet: string
  index: number
  snippets: string[]
  onUpdate: (index: number, newSnippet: string) => void
  onDelete: (index: number) => void
}) => (
  <div className="guidance-snippet-modal__snippet-input">
    <TextField
      textarea
      label="Snippet input"
      value={snippet}
      rows={3}
      maxLength={MAX_SNIPPET_CHARACTER_LENGTH}
      characterCount
      onChange={(e) => onUpdate(index, e.currentTarget.value)}
    />
    {snippets.length > 1 && (
      <div
        className="guidance-snippet-modal__delete-snippet"
        onClick={() => onDelete(index)}
      >
        <IconDelete />
      </div>
    )}
  </div>
)

export const GuidanceSnippetModal = ({
  onClose,
  savedSnippetId
}: {
  onClose: () => void
  savedSnippetId?: string
}) => {
  const dispatch = useDispatch()

  // Get current snippet data if we're editing an existing snippet
  const savedSnippet = useSelector((state: AppState) =>
    savedSnippetId
      ? state.sqlNotebook.guidanceSnippets.snippets?.find(
          (s) => s.snippet_id === savedSnippetId
        )
      : undefined
  )

  // Supports batch adding snippets; index 0 will be used if editing a single snippet.
  const [snippets, setSnippets] = useState<string[]>([
    savedSnippet?.snippet || ""
  ])

  // Deleted snippets may be visible in/accessed via guidance snippets widget in cell, but
  // this modal should always show the current snippet state.
  const isDeletedSnippet = savedSnippetId && !savedSnippet
  const readOnly = !useIsGuidanceSnippetEditor() || isDeletedSnippet

  const handleUpdateSnippets = (index: number, newSnippet: string): void => {
    const updatedSnippets = [...snippets]
    updatedSnippets[index] = newSnippet
    setSnippets(updatedSnippets)
  }

  // Removes an input field when batch adding
  const handleDeleteSnippet = (index: number): void => {
    const updatedSnippets = snippets.filter((_, i) => i !== index)
    setSnippets(updatedSnippets)
  }

  // Adds blank input for batch adding
  const addSnippetInput = (): void => {
    setSnippets([...snippets, ""])
  }

  const saveGuidanceSnippets = (): void => {
    if (savedSnippet) {
      // Only allow editing the one you're editing, not add more/remove etc.
      dispatch(
        sqlNotebookUpdateGuidanceSnippetThunk(
          savedSnippet.snippet_id,
          snippets[0]
        )
      )
    } else {
      dispatch(sqlNotebookInsertGuidanceSnippets(snippets))
    }
    onClose()
  }

  const editingSnippetUnchanged =
    savedSnippet !== undefined && savedSnippet?.snippet === snippets[0]

  const getTitleVerb = () => {
    if (readOnly) {
      return "View"
    } else if (savedSnippet) {
      return "Edit"
    }
    return "Add"
  }
  const getActionButtonLabel = () => {
    if (savedSnippet) {
      return "Update"
    } else {
      return snippets.length > 1 ? `Create (${snippets.length})` : "Create"
    }
  }

  return (
    <SimpleDialog
      open
      className="guidance-snippet-modal app-overlay"
      title={
        <div className="guidance-snippet-modal__header">
          <div className="guidance-snippet-modal__header-title">
            {getTitleVerb()} guidance snippet
          </div>
          {savedSnippet ? (
            <GuidanceSnippetTimestamp
              timestamp={moment.utc(savedSnippet.updated_at)}
            />
          ) : (
            <Tooltip
              align="right"
              activateOn="click"
              content={<SnippetTipsPopover />}
              className="snippet-tips-popover"
            >
              <div className="guidance-snippet-modal__header-info">
                <IconInfoOutline />
                Learn more about how to use guidance snippets
              </div>
            </Tooltip>
          )}
        </div>
      }
      onClose={onClose}
      footer={
        <div className="guidance-snippet-modal__footer">
          <Button outlined onClick={onClose} label="Cancel" />
          {!readOnly && (
            <Button
              type={BUTTON_TYPES.SECONDARY}
              onClick={saveGuidanceSnippets}
              disabled={
                snippets.some((s) => s.trim() === "") || editingSnippetUnchanged
              }
              label={getActionButtonLabel()}
            />
          )}
        </div>
      }
    >
      {!savedSnippetId && (
        <div className="guidance-snippet-modal__usage-tips-header">
          <p>
            Guidance snippets are hints to help the model generate more accurate
            answers.
          </p>
        </div>
      )}
      <div className="guidance-snippet-modal__body">
        <div className="guidance-snippet-modal__input-header">
          <p className="guidance-snippet-modal__input-header-label">
            Guidance content
          </p>
        </div>
        {isDeletedSnippet && <div>Snippet has been removed.</div>}
        {readOnly ? (
          <div className="guidance-snippet-modal__snippet-view">
            {savedSnippet?.snippet}
          </div>
        ) : (
          <div className="guidance-snippet-modal__snippet-inputs">
            {snippets.map((s, index) => (
              <SnippetInput
                key={index}
                snippet={s}
                index={index}
                snippets={snippets}
                onUpdate={handleUpdateSnippets}
                onDelete={handleDeleteSnippet}
              />
            ))}
          </div>
        )}
        {snippets.length < MAX_SNIPPET_INPUTS && !savedSnippet && !readOnly && (
          <Button
            outlined
            className="guidance-snippet-modal__add-snippet-button"
            onClick={addSnippetInput}
            label={<IconPlus />}
          />
        )}
      </div>
    </SimpleDialog>
  )
}
