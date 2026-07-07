// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import "components/chart-settings/styles.scss"

type SelectOption = {
  value: string | boolean
  label: string | boolean
}

type Props = {
  color: any
  selectPriorityColor: (option: SelectOption) => void
}

function getPriorityColorOptions(categories = []) {
  const priorityColorOptions: SelectOption[] = []
  categories.forEach((category: string | boolean) => {
    priorityColorOptions.push({ label: category, value: category })
  })
  return priorityColorOptions
}

const PriorityColorSelector: FC<Props> = ({ color, selectPriorityColor }) => {
  const priorityColorOptions = [
    { label: "No prioritized color", value: "no_priority" },
    ...getPriorityColorOptions(color.customDomain)
  ]
  return (
    <div className="priority-option-selector">
      <MultiSelect
        data-testid="priority-option-selector"
        noLabel={false}
        value={
          // currently only one priority color allowed
          color.prioritizedColor
            ? color.prioritizedColor[0]
            : priorityColorOptions[0]
        }
        placeholder={"Prioritized color"}
        options={priorityColorOptions}
        onChange={(option: SelectOption) => selectPriorityColor(option)}
      />
    </div>
  )
}

export default PriorityColorSelector
