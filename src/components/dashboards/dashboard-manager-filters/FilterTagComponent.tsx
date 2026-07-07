// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Icon } from "@rmwc/icon"
import { FilterTag } from "./dashboard-manager-filter-types"
import {
  filterTagValueLabel,
  filterTagTypeLabel
} from "./dashboard-manager-filter-utils"

type Props = {
  filterTag: FilterTag
  removeFilterTag: (filterTag: FilterTag) => void
  setSelectedFilter: (filterTag: FilterTag) => void
}

const FilterTagComponent: FC<Props> = ({
  filterTag,
  removeFilterTag,
  setSelectedFilter
}) => {
  const filterTagType: string = Object.keys(filterTag)[0]

  const setSelected = () => setSelectedFilter(filterTag)

  const onRemove = (e) => {
    e.stopPropagation()
    removeFilterTag(filterTag)
  }

  return (
    // Filter tags resize when exiting edit mode, so if the mouse is positioned
    // in a certain spot, it can catch the mouseup/click event that corresponds
    // to the mousedown event that triggers exiting edit mode/closing popover.
    // Use onMouseDown for setSelected to prevent this.
    <div className="dashboard-manager-filter-tag" onMouseDown={setSelected}>
      <div className="filter-type">{filterTagTypeLabel(filterTagType)}:</div>
      <div className="filter-value">{filterTagValueLabel(filterTag)}</div>
      <Icon className="remove-filter-tag" icon="close" onMouseDown={onRemove} />
    </div>
  )
}

export default FilterTagComponent
