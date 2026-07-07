// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import "./link-button.scss"

export const LinkButton = ({
  text,
  onClick
}: {
  text: string
  onClick: () => void
}) => {
  return (
    <span className="sql-notebook-link-button" onClick={onClick}>
      {text}
    </span>
  )
}
