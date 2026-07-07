// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { SimpleDialog } from "@rmwc/dialog"
import { Button } from "@rmwc/button"

import { YieldWarningIcon } from "components/svg-icons/icon-yield-warning"
import "./palette-mapping-warning-modal.scss"

export type WarningAction = "save" | "discard" | "cancel"
export const WARNING_ACTIONS = {
  SAVE: "save" as WarningAction,
  DISCARD: "discard" as WarningAction,
  CANCEL: "cancel" as WarningAction
}

export const PaletteMappingWarningModal = ({
  open,
  title = "Unsaved Mapping",
  description = "",
  confirmLabel = "Save",
  onCancel,
  onSave,
  onDiscard
}: {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  onCancel: () => void
  onSave: () => void
  onDiscard: () => void
}) => {
  return (
    <SimpleDialog
      open={open}
      className="palette-mapping-warning-modal app-overlay"
      title={
        <div className="palette-mapping-warning-modal__title">
          <div className="palette-mapping-warning-modal__icon">
            <YieldWarningIcon />
          </div>
          {title}
        </div>
      }
      // Pass null so the buttons don't render, we'll do our own footer
      acceptLabel={null}
      cancelLabel={null}
      footer={
        <div className="palette-mapping-warning-modal__footer">
          <div>
            <Button outlined onClick={onCancel}>
              Go Back
            </Button>
          </div>
          <div>
            <Button outlined onClick={onDiscard}>
              <div>Discard Changes</div>
            </Button>
            <Button onClick={onSave}>
              <div>{confirmLabel}</div>
            </Button>
          </div>
        </div>
      }
    >
      <div className="palette-mapping-warning-modal__body">
        <h3>You have unsaved mapping changes</h3>
        <div>{description}</div>
      </div>
    </SimpleDialog>
  )
}
