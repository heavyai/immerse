// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Icon } from "@rmwc/icon"
import "./sql-notebook-error.scss"

// Body for error snackbars
export const SqlNotebookError = ({ message }: { message: string }) => (
  <div className="sql-notebook-error">
    <Icon icon="warning" />
    {message}
  </div>
)
