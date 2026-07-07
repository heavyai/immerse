// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { Icon } from "@rmwc/icon"

const LauncherLink = ({ url, label }: { url: string; label: string }) => {
  return (
    <li className="launcher-link">
      <a href={url} target="_blank" rel="noreferrer">
        <Icon icon="launch" />
        {label}
      </a>
    </li>
  )
}

export default LauncherLink
