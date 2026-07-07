// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { SimpleDialog } from "@rmwc/dialog"
import { TextField } from "@rmwc/textfield"
import { Button } from "@rmwc/button"

import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"
import { PaletteMappingEmptyIcon } from "./palette-mapping-empty-icon"
import { PaletteMappingIcon } from "./palette-mapping-icon"
import "./palette-mapping-name-modal.scss"

export const PaletteMappingNameModal = ({
  open,
  title = "New Mapping",
  createLabel = "Create",
  showInfoBox = true,
  infoBoxContent,
  onClose,
  onConfirm,
  defaultName
}: {
  open: boolean
  title?: string
  createLabel?: string
  showInfoBox?: boolean
  infoBoxContent?: string | JSX.Element
  onClose: () => void
  onConfirm: (n: string | undefined) => void
  defaultName?: string
}) => {
  const [name, setName] = useState(defaultName)
  const submitDisabled = !name?.length
  const onSubmit = () => {
    onConfirm(name)
    setName("")
  }
  return (
    <SimpleDialog
      open={open}
      onClose={onClose}
      className="palette-mapping-name-modal app-overlay"
      title={
        <div className="palette-mapping-name-modal__title">
          <PaletteMappingIcon /> {title}
        </div>
      }
      // Pass null so the buttons don't render, we'll do our own footer
      acceptLabel={null}
      cancelLabel={null}
      footer={
        <div className="palette-mapping-name-modal__footer">
          <Button outlined onClick={onClose}>
            Go Back
          </Button>
          <Button disabled={submitDisabled} onClick={onSubmit}>
            <TooltipIfContent
              content={submitDisabled ? "Name is required" : null}
            >
              <div>{createLabel}</div>
            </TooltipIfContent>
          </Button>
        </div>
      }
    >
      <div className="palette-mapping-name-modal__body">
        {showInfoBox && (
          <div className="palette-mapping-name-modal__intro-banner">
            <div>
              <PaletteMappingEmptyIcon />
            </div>
            <section>
              {infoBoxContent ?? (
                <p>
                  Creating a new mapping will tie colors to strings and easily
                  share those colors across multiple charts within this
                  dashboard.
                </p>
              )}
              <p className="palette-mapping-name-modal__intro-banner--warning">
                Note: Mapping changes do not sync across dashboards. Any changes
                will effect the current dashboard only.
              </p>
            </section>
          </div>
        )}
        <div>
          <TextField
            required
            outlined
            label="Name"
            value={name}
            onChange={(evt) => setName(evt.currentTarget.value)}
            onKeyUp={(evt) => {
              if (evt.key === "Enter" && !submitDisabled) {
                onSubmit()
              }
            }}
          />
        </div>
      </div>
    </SimpleDialog>
  )
}
