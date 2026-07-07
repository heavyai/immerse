// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { BUTTON_TYPES, Button, ButtonGroup } from "../components/button"
import { SendIcon } from "components/svg-icons/icon-send"
import { IconClipboard } from "components/svg-icons/icon-clipboard"

import "./sql-notebook-result-cell-actions.scss"
import { Tooltip } from "@rmwc/tooltip"

export const ResultCellActions = ({
  onRun,
  onCancel,
  runDisabled = false,
  runLabel = "Run",
  onRunSelected
}: {
  onRun: () => void
  onCancel?: () => void
  runDisabled?: boolean
  runLabel?: string
  onRunSelected?: () => void | null
}) => {
  return (
    <ButtonGroup className="result-cell-actions">
      <Button
        type={BUTTON_TYPES.SUCCESS}
        trailingIcon={<SendIcon />}
        label={runLabel}
        disabled={runDisabled}
        onClick={onRun}
      />
      {/* Leaving this around for implementing copy selected to new cell */}
      {Boolean(onRunSelected) && (
        <>
          <Tooltip content="Copy selected text to new cell" enterDelay={300}>
            <Button label={<IconClipboard />} onClick={onRunSelected} />
          </Tooltip>
        </>
      )}
      {onCancel && <Button outlined label="Cancel" onClick={onCancel} />}
    </ButtonGroup>
  )
}
