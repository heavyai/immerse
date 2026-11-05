// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { NutIcon } from "components/svg-icons/icon-nut"
import { MenuSurfaceAnchor } from "@immerse/ui"
import { UsedSnippetsPopover } from "./used-snippets-popover"
import { UsedSnippet } from "../types"
import "./used-snippets-indicator.scss"

export const UsedSnippetsIndicator = ({
  snippets
}: {
  snippets: UsedSnippet[]
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  return (
    <div className="used-snippets-indicator">
      <MenuSurfaceAnchor>
        <button
          type="button"
          aria-haspopup="menu"
          aria-label="Options"
          className="used-snippets-indicator__widget"
          onClick={(e) => {
            e.stopPropagation()
            setPopoverOpen(true)
          }}
        >
          <NutIcon />
          {snippets.length}
        </button>
        <UsedSnippetsPopover
          snippets={snippets}
          open={popoverOpen}
          setOpen={setPopoverOpen}
        />
      </MenuSurfaceAnchor>
    </div>
  )
}
