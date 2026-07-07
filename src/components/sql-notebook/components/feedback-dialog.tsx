// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { TextField } from "@rmwc/textfield"
import { CustomDialog } from "components/custom-dialog"
import { Button, BUTTON_TYPES } from "./button"
import "./feedback-dialog.scss"

export const FeedbackDialog = ({
  setInputValue,
  inputValue,
  onSubmit,
  onCancel
}: {
  setInputValue: (comment: string) => void
  inputValue: string
  onSubmit: () => void
  onCancel: () => void
}) => {
  return (
    <CustomDialog>
      <div className="feedback-dialog">
        <h2>Additional feedback</h2>
        <h4>Provide a comment</h4>
        <TextField
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          textarea
        />
        <footer>
          <Button outlined label="Cancel" onClick={onCancel} />
          <Button
            type={BUTTON_TYPES.SUCCESS}
            label="Submit"
            onClick={onSubmit}
          />
        </footer>
      </div>
    </CustomDialog>
  )
}
