// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useRef, useState } from "react"
import { connect } from "react-redux"

import useOutsideClick from "@rooks/use-outside-click"
import cx from "classnames"
import IconComponent from "components/icon/icon"
import { CollapsibleList } from "@rmwc/list"
import { List } from "widgets/list/List"
import { Switch } from "widgets/switch/Switch"
import FilterSetsListItem from "./filter-sets-list-item"
import "./filter-sets-list.scss"

import {
  addFilterSet,
  selectFilterSet,
  deleteFilterSet,
  renameFilterSet,
  duplicateFilterSet
} from "../filter-sets-action-creators"
import { getFilterSets, getSelectedFilterSet } from "../filter-sets-selectors"

const LABEL_ADD = "+ Add filter set"
const LABEL_FILTER_SET = "Filter set"

type Props = {
  filterSets: object
  selectedFilterSet: object
  addFilterSet: () => void
  selectFilterSet: (filterSetId: string) => void
  deleteFilterSet: (filterSetId: string) => void
  duplicateFilterSet: (filterSetId: string) => void
  renameFilterSet: (filterSetId: string, name: string) => void
  toggleAllFilters: () => void
  numActiveFiltersForSelectedFilterSet: number
  numValidFiltersForFilterSet: number
  showAdvancedFilterControls: boolean
}

const FilterSetsList: FC<Props> = (props) => {
  const selectedFilterSetName = props.selectedFilterSet
    ? props.selectedFilterSet.name
    : ""
  const notLastFilterSet = Object.keys(props.filterSets).length !== 1
  const listRef = useRef(null)
  const [listOpen, setListOpen] = useState(false)

  const closeList = () => {
    if (listOpen) {
      setListOpen(!listOpen)
    }
  }

  useOutsideClick(listRef, closeList)

  return (
    <List className="filter-sets-list" data-testid="filter-sets-list" dense>
      <div className="filter-sets-list__notch" />
      <div className="filter-sets-list__label">{LABEL_FILTER_SET}</div>
      <Switch
        className="filter-sets-list__toggle"
        checked={props.numActiveFiltersForSelectedFilterSet > 0}
        disabled={props.numValidFiltersForFilterSet === 0}
        onChange={props.toggleAllFilters}
      />
      <div ref={listRef} className="filter-sets-list__items-container-outer">
        <CollapsibleList
          open={listOpen}
          handle={
            <div
              className="filter-set-item filter-set-item--selected"
              data-testid="filter-set-selector"
              onClick={() => setListOpen(!listOpen)}
            >
              <div className="filter-set-item__title">
                <div className="filter-set-item__title-text">
                  {selectedFilterSetName}
                  <span className="filter-set-item__filter-count">
                    {` (${props.numActiveFiltersForSelectedFilterSet})`}
                  </span>
                </div>
              </div>
              <div>
                <IconComponent className="tick-icon" name="tick" />
              </div>
            </div>
          }
        >
          {listOpen && (
            <div className="filter-sets-list__items">
              <div className="filter-sets-list__items-container">
                {Object.keys(props.filterSets)
                  .sort()
                  .map((filterSetId, i) => (
                    <FilterSetsListItem
                      key={i}
                      filterSetId={filterSetId}
                      filterSetName={props.filterSets[filterSetId].name}
                      deleteFilterSet={props.deleteFilterSet}
                      duplicateFilterSet={props.duplicateFilterSet}
                      renameFilterSet={props.renameFilterSet}
                      selectFilterSet={props.selectFilterSet}
                      closeList={closeList}
                      showAdvancedFilterControls={
                        props.showAdvancedFilterControls
                      }
                      enableDeleteFilterSet={notLastFilterSet}
                    />
                  ))}
                <div
                  className={cx("filter-set-item", {
                    hidden: !props.showAdvancedFilterControls
                  })}
                  onClick={() => setListOpen(!listOpen)}
                >
                  <div className="filter-set-item__title">
                    <div
                      className="filter-set-item__title-text"
                      onClick={() => props.addFilterSet()}
                    >
                      {LABEL_ADD}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollapsibleList>
      </div>
    </List>
  )
}

const mapStateToProps = (state: object) => ({
  filterSets: getFilterSets(state),
  selectedFilterSet: getSelectedFilterSet(state)
})

export default connect(mapStateToProps, {
  addFilterSet,
  selectFilterSet,
  deleteFilterSet,
  duplicateFilterSet,
  renameFilterSet
})(FilterSetsList)
