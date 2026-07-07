// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

import { IconJoinContains } from "components/svg-icons/icon-join-contains"
import { IconJoinIntersects } from "components/svg-icons/icon-join-intersects"
import { SelectableCard } from "components/selectable-card/selectable-card"

import "./join-condition-selector.scss"
import {
  GEO_JOIN_COMPATIBILITY,
  JOIN_CONDITION_TYPES
} from "components/join-manager/constants"

export const JOIN_CONDITIONS = [
  {
    icon: <IconJoinContains testId="icon-join-contains" />,
    value: JOIN_CONDITION_TYPES.CONTAINS,
    title: "Contains",
    description: "Geometry is fully within the joining geometry"
  },
  {
    icon: <IconJoinIntersects testId="icon-join-intersects" />,
    value: JOIN_CONDITION_TYPES.INTERSECTS,
    title: "Intersects",
    description: "Geometry that intersects with the joining geometry"
  }
]
type JoinCondition = typeof JOIN_CONDITIONS[number]
type JoinConditionSelectorProps = {
  onSelect: Function
  selectedValue: null | string
  leftType: string
  rightType: string
}

export const JoinConditionSelector: FC<JoinConditionSelectorProps> = ({
  onSelect,
  selectedValue = null,
  leftType,
  rightType
}) => {
  const isConditionDisabled = (joinCondition: JoinCondition) => {
    const compatibleTypes = GEO_JOIN_COMPATIBILITY[joinCondition.value]
    // If it's valid either way around then it's valid. It will be flipped when generating the query
    return (
      !compatibleTypes?.[rightType]?.includes(leftType) &&
      !compatibleTypes?.[leftType]?.includes(rightType)
    )
  }
  return (
    <div
      className="join-condition-selector"
      data-testid="join-condition-selector"
    >
      {JOIN_CONDITIONS.map((jc) => {
        return (
          <SelectableCard
            {...jc}
            key={jc.value}
            onSelect={() => {
              onSelect(jc.value === selectedValue ? null : jc.value)
            }}
            disabled={isConditionDisabled(jc)}
            selected={selectedValue === jc.value}
            disabledTooltip={
              "Geometry types are not compatible with this join condition"
            }
          />
        )
      })}
    </div>
  )
}
