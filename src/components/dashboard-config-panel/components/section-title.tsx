// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { ListItem, ListItemMeta } from "@rmwc/list"
import { noop } from "utils/helpers"

import "./section-title.scss"

interface Props {
  onClick?: () => void
  title?: string
  className?: string
}

const SectionTitle: FC<Props> = ({
  onClick = noop,
  title = "",
  className = "",
  icon = "chevron_left"
}) => {
  const cx = `dashboard-config-section-title-container ${className}`
  return (
    <ListItem className={cx} onClick={onClick}>
      <div className="dashboard-config-section-title">
        <div>{title}</div>
        <ListItemMeta icon={icon} className="expand-right" />
      </div>
    </ListItem>
  )
}

export default SectionTitle
