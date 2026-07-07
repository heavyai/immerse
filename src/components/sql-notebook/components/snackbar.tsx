// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SnackbarQueue, SnackbarQueueProps } from "@rmwc/snackbar"
import React from "react"

import "./snackbar.scss"

export const SqlNotebookSnackbar = (props: SnackbarQueueProps) => (
  <SnackbarQueue className="sql-notebook__snackbar" {...props} />
)
