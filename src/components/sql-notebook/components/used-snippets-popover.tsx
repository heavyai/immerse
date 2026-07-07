// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { useDispatch } from "react-redux"
import { Icon } from "@rmwc/icon"
import { MenuSurface } from "@rmwc/menu"
import { NutIcon } from "components/svg-icons/icon-nut"
import { sqlNotebookOpenGuidanceModal } from "../redux/sql-notebook-action-creators"
import { UsedSnippet } from "../types"
import "./used-snippets-popover.scss"

export const UsedSnippetsPopover = ({
  snippets,
  open,
  setOpen
}: {
  snippets: UsedSnippet[]
  open: boolean
  setOpen: (openState: boolean) => void
}) => {
  const dispatch = useDispatch()
  return (
    <MenuSurface
      open={open}
      onClose={() => {
        setOpen(false)
      }}
      anchorCorner="bottomStart"
      className="used-snippets-popover"
    >
      <h6>
        <NutIcon /> Guidance Snippets Used
      </h6>
      <div>
        {snippets.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setOpen(false)
              dispatch(sqlNotebookOpenGuidanceModal(s.id))
            }}
            className="used-snippets-popover__item"
          >
            <div>{s.snippet}</div>
            <Icon icon="open_in_new" />
          </div>
        ))}
      </div>
    </MenuSurface>
  )
}
