// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Tooltip } from "@rmwc/tooltip"
import { Icon as GlyphIcon } from "@rmwc/icon"

import "./styles.scss"

type Props = {
  tooltipText: string
  enterDelay: number
  icon: string
}

const IconTooltip: FC<Props> = ({ tooltipText, enterDelay, icon }) => (
  <Tooltip
    className="icon-with-tooltip"
    content={tooltipText}
    enterDelay={enterDelay}
    showArrow
  >
    <GlyphIcon icon={icon} />
  </Tooltip>
)

export default IconTooltip
