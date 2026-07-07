// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import "./sql-editor-cta.scss"

export const SqlEditorCTA = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="text-input-cell__sql-cta" onClick={onClick}>
      SQL Editor
    </div>
  )
}
