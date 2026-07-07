// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import cx from "classnames"

import "./selectable-card.scss"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

type SelectableCardProps = {
  title: string
  description: string
  icon: React.ReactNode | string
  selected: boolean
  onSelect: React.MouseEventHandler<HTMLDivElement>
  disabled: boolean
  disabledTooltip: string | null
}

export const SelectableCard: FC<SelectableCardProps> = ({
  title,
  description,
  icon,
  selected,
  onSelect,
  disabled = false,
  disabledTooltip
}) => {
  return (
    <TooltipIfContent
      content={disabled ? disabledTooltip : null}
      align="bottom"
      showArrow
    >
      <div
        onClick={(e) => {
          if (!disabled) {
            onSelect(e)
          }
        }}
        className={cx("selectable-card", { selected, disabled })}
        data-testid="selectable-card"
      >
        {icon && (
          <section
            className="selectable-card__icon"
            data-testid="selectable-card-icon"
          >
            <div>{icon}</div>
          </section>
        )}
        <section className="selectable-card__content">
          <div className="selectable-card__title">
            <strong>{title}</strong>
          </div>
          <div className="selectable-card__description">{description}</div>
        </section>
      </div>
    </TooltipIfContent>
  )
}
