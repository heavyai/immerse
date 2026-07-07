// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { List } from "widgets/list/List"
import { SimpleListItem } from "@rmwc/list"

import { SelectOption } from "./dashboard-manager-filter-types"
import "./styles.scss"

type Props = {
  options: SelectOption[]
  selectOption: (o: SelectOption) => void
  initialValue?: string | boolean
}

const DashboardManagerFiltersSimpleSelect: FC<Props> = ({
  options,
  selectOption,
  initialValue
}) => {
  return (
    <div className="dashboard-mngr-simple-select-wrapper">
      <List extraCompact>
        {options.map((o, i) => (
          <SimpleListItem
            key={i}
            text={String(o.label)}
            onMouseDown={() => selectOption(o)}
            selected={initialValue === o.value}
          />
        ))}
      </List>
    </div>
  )
}

export default DashboardManagerFiltersSimpleSelect
