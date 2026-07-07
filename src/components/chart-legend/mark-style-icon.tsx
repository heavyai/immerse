// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

export const MARK_STYLES = Object.freeze(["solid", "dashes", "dotted"])

// TODO: mark types should explicitly default to "block" style.  Not an implicit value based off chartType
// coupled w/ the style passed along on the palette. Changing that would greatly simplify this logic.
const getMarkStyleClassName = (markStyle: string, isLineMarkStyle: boolean) =>
  `mark-style-icon mr-2${isLineMarkStyle ? ` line ${markStyle}` : ""}`

type MarkStyleIconProps = {
  style: string
  value: string
  chartType: string
}
const MarkStyleIcon = ({
  style: markStyle,
  value: markColor,
  chartType
}: MarkStyleIconProps): React.ReactElement => {
  const isLineMarkStyle = Boolean(
    MARK_STYLES.includes(markStyle) && chartType === "line"
  )
  const colorRulePrefix = isLineMarkStyle ? "border" : "background"
  const style = { [`${colorRulePrefix}Color`]: markColor }

  return (
    <span
      {...{
        style,
        className: getMarkStyleClassName(markStyle, isLineMarkStyle)
      }}
    />
  )
}

export default MarkStyleIcon
