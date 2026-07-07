// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import Portal from "components/portal/Portal"
import "./styles.scss"

export const CustomDialog = ({ children }: { children: React.ReactNode }) => (
  <Portal rootId="custom-dialog-root">
    <div id="custom-dialog__container">
      <div id="custom-dialog__scrim" />
      <div className="custom-dialog__content">{children}</div>
    </div>
  </Portal>
)
