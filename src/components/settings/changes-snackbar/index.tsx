// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import IconSnackbarAlert from "components/svg-icons/icon-snackbar-alert"
import { PrimaryButton } from "widgets/button/Button"

import "./styles.scss"

const ChangesSnackbar = ({
  onSave,
  onReset
}: {
  onSave: () => void
  onReset: () => void
}) => {
  return (
    <div className="changes-snackbar">
      <div>
        <IconSnackbarAlert />
        <span>You have unsaved changes</span>
      </div>
      <div className="changes-snackbar__actions">
        <div onClick={onReset}>Reset</div>
        <PrimaryButton onClick={onSave}>Save changes</PrimaryButton>
      </div>
    </div>
  )
}

export default ChangesSnackbar
