// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import "./statistic.scss"
import { formatNumber } from "charts/utils/coordinate-helpers"

export type Stat = {
  label: string
  value: number | string
  tooltip?: string
  formatFn?: (v: number | string) => number | string
}

export const Statistic = ({
  label,
  value,
  tooltip,
  formatFn = formatNumber
}: Stat) => {
  const formattedValue = typeof value === "number" ? formatFn(value) : value
  return (
    <div className="data-preview__statistic">
      <section className="data-preview__statistic--title">
        <header>{label}</header>
        {tooltip && (
          <Tooltip content={tooltip}>
            <Icon icon={{ icon: "info_outline", size: "xsmall" }} />
          </Tooltip>
        )}
      </section>
      <section className="data-preview__statistic--value">
        {formattedValue}
      </section>
    </div>
  )
}

export const StatisticSet = ({
  style,
  children
}: {
  children: Array<JSX.Element>
  style: React.StyleHTMLAttributes<HTMLElement>
}) => {
  return (
    <section style={style} className="sql-notebook__statistic-set">
      {children}
    </section>
  )
}
