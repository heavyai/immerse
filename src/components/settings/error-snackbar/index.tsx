// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Snackbar, SnackbarProps } from "@rmwc/snackbar"
import React from "react"

import "./styles.scss"

export const SettingsErrorSnackbar = (props: SnackbarProps) => (
  <Snackbar className="settings-error-snackbar" {...props} />
)
