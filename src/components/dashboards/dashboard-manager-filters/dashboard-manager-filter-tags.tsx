// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useRef, useEffect } from "react"
import cx from "classnames"
import FilterTagComponent from "./FilterTagComponent"
import FilterTypePickerComponent, {
  filterTypesMap
} from "./FilterTypePickerComponent"
import FilterValuePickerComponent from "./FilterValuePickerComponent"
import "./styles.scss"
import { FrontEndViewShape } from "./dashboard-manager-filters"
import {
  isValidFilter,
  selectOptionLabel
} from "./dashboard-manager-filter-utils"
import { FilterTag } from "./dashboard-manager-filter-types"

type Props = {
  filterTags: FilterTag[]
  list: FrontEndViewShape[]
  addFilterTag: (filterTag: FilterTag) => void
  removeFilterTag: (filterTag: FilterTag) => void
}

const DashboardManagerFilterTags: FC<Props> = ({
  filterTags,
  list,
  addFilterTag,
  removeFilterTag
}) => {
  const [selectedFilter, setSelectedFilter] = useState(null)
  const [scrollbarVisible, setScrollbarVisible] = useState(false)

  const tagsWrapperRef = useRef(null)

  // Handles styling to make room for scrollbar when present
  useEffect(() => {
    const hasScrollbar =
      tagsWrapperRef?.current.clientWidth < tagsWrapperRef?.current.scrollWidth
    if (hasScrollbar !== scrollbarVisible) {
      setScrollbarVisible(hasScrollbar)
    }
  }, [selectedFilter, filterTags, scrollbarVisible])

  const getOptions = (selected) => {
    const optionsSet = new Set()
    const filterType = selected && Object.keys(selected)[0]

    list.forEach((l) => {
      if (filterType === "source") {
        const dashboardSources =
          l.dashboard_metadata && JSON.parse(l.dashboard_metadata).table
        if (dashboardSources) {
          dashboardSources
            .split(", ")
            .forEach((source) => optionsSet.add(source))
        }
      } else {
        optionsSet.add(l[filterTypesMap[filterType]])
      }
    })

    return Array.from(optionsSet)
      .sort()
      .map((optionValue) => ({
        value: optionValue,
        label: selectOptionLabel(filterType, optionValue)
      }))
  }

  const onSetFilterType = ({ value }) => {
    const existingFilter = filterTags.find(
      (tag) => Object.keys(tag)[0] === value
    )
    if (existingFilter && isValidFilter(existingFilter)) {
      setSelectedFilter(existingFilter)
    } else {
      const currentFilter = {}
      currentFilter[value] = null
      setSelectedFilter(currentFilter)
    }
  }

  const onSetFilter = (filter) => {
    addFilterTag(filter)
  }

  const scrollTagsContainerToStart = () => {
    if (tagsWrapperRef) {
      tagsWrapperRef.current.scroll({
        left: 0
      })
    }
  }

  const removeFilterFromTagsAndSelected = (filterTag) => {
    setSelectedFilter(null)
    removeFilterTag(filterTag)
  }

  return (
    <div className="dashboard-mngr-filter-tags-container">
      <div className="dashboard-mngr-filter-picker-container">
        <FilterTypePickerComponent setFilterType={onSetFilterType} />
      </div>
      <div
        data-testid={"dashboard-mngr-tags-wrapper"}
        className={cx("dashboard-mngr-tags-wrapper", {
          "scrollbar-visible": scrollbarVisible
        })}
        ref={tagsWrapperRef}
      >
        {selectedFilter && (
          <FilterValuePickerComponent
            selectedFilter={selectedFilter}
            setFilter={onSetFilter}
            defaultMenuOpenState
            options={getOptions(selectedFilter)}
            setSelectedFilter={setSelectedFilter}
            filterTag={selectedFilter}
            removeFilterTag={removeFilterFromTagsAndSelected}
            scrollTagsContainer={scrollTagsContainerToStart}
          />
        )}
        {filterTags
          .filter((filter) => selectedFilter !== filter)
          .map((entry, index) => (
            <FilterTagComponent
              key={index}
              filterTag={entry}
              removeFilterTag={removeFilterFromTagsAndSelected}
              setSelectedFilter={setSelectedFilter}
            />
          ))}
      </div>
    </div>
  )
}

export default DashboardManagerFilterTags
