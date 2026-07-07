// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { DialogActions, DialogContent, DialogTitle } from "@rmwc/dialog"
import { InfoDialog } from "widgets/dialog/Dialog"
import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { closeRefreshModal } from "actions/ui-action-creators"

export const RefreshPromptModal = () => {
  const dispatch = useDispatch()
  return (
    <InfoDialog open>
      <DialogTitle className="modal-header">Settings update</DialogTitle>
      <DialogContent className="modal-body">
        Settings have been updated. Refresh to apply updates.
      </DialogContent>
      <DialogActions className="modal-footer">
        <SecondaryButton onClick={() => dispatch(closeRefreshModal())}>
          Ignore
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            location.reload()
          }}
        >
          Reload
        </PrimaryButton>
      </DialogActions>
    </InfoDialog>
  )
}
