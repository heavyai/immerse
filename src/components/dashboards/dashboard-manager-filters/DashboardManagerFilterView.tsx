// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useRef, useState } from "react"
import {
  FilterTag,
  FilterView,
  UpdateFilterView
} from "./dashboard-manager-filter-types"
import IconSave from "../../svg-icons/icon-save"
import FilterSetsListItem from "../../new-filters/filter-sets/filter-sets-list-item"
import cx from "classnames"
import useOutsideClick from "@rooks/use-outside-click"
import IconComponent from "../../icon/icon"
import { isEqual } from "lodash"
import { Switch } from "widgets/switch/Switch"
import { defaultView } from "./dashboard-manager-filters"

type Props = {
  filterViews: FilterView[]
  currentView: FilterView
  toggleFilters: (toggleState: boolean) => void
  filterEnabled: boolean
  saveFilterView: (filterView: FilterView) => void
  updateFilterView: (updateFilterView: UpdateFilterView) => void
  selectFilterView: (filterView: FilterView) => void
  deleteFilterView: (filterView: FilterView) => void
  updateCurrentViewName: (newName: string) => void
  currentDBname: string
}
const LABEL_ADD = "+ Add filter view"
const TOOLTIP_DUPLICATE = "Duplicate current filter view"
const TOOLTIP_REMOVE = "Remove filter view"

const isValidFilterViewName = (name: string | null) =>
  name && name !== "Unsaved view"

const DashboardManagerFilterView: FC<Props> = ({
  filterViews,
  toggleFilters,
  filterEnabled,
  saveFilterView,
  updateFilterView,
  selectFilterView,
  deleteFilterView,
  currentView,
  updateCurrentViewName,
  currentDBname
}) => {
  const [saveDisabled, setSaveDisabled] = useState(true)
  const listRef = useRef(null)
  const [listOpen, setListOpen] = useState(false)
  const toggleMenu = () => setListOpen(!listOpen)
  const closeMenu = () => setListOpen(false)
  const [nameEditable, setNameEditable] = useState(false)
  const [nameEdited, setNameEdited] = useState(false)
  const [isNewView, setIsNewView] = useState(false)
  const [selectedView, setSelectedView] = useState(currentView)
  const nameRef = useRef(null)
  const [currentViewName, setCurrentViewName] = useState(
    currentView.filterViewName
  )

  useEffect(() => {
    if (
      !isEqual(currentView.filterTags, selectedView.filterTags) &&
      isValidFilterViewName(currentView.filterViewName) &&
      currentView.filterTags.length
    ) {
      setSaveDisabled(false)
    }
  }, [
    currentView.filterTags,
    selectedView.filterTags,
    currentView.filterViewName
  ])

  // the input value is not getting updated when db switches, so need to manually update here :(
  useEffect(() => {
    nameRef.current.value = currentView.filterViewName
  }, [currentView, currentView.filterViewName])

  useEffect(() => {
    setSaveDisabled(true)
    setCurrentViewName(currentView.filterViewName)
    setSelectedView(currentView)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDBname])

  useEffect(() => {
    if (
      currentView.filterViewName !== currentViewName &&
      isValidFilterViewName(currentView.filterViewName) &&
      !currentView.filterTags.length
    ) {
      setCurrentViewName(currentView.filterViewName)
      nameRef.current.value = currentView.filterViewName
      setIsNewView(true)
    }
  }, [currentView, currentViewName])

  const onSaveFilterView = (name: string, filterTags: FilterTag[]) => {
    if (name && filterTags.length && !saveDisabled) {
      if (nameEdited && !isNewView && filterViews.length) {
        // Name is changed
        const filterView = {
          oldFilterView: { filterViewName: currentViewName, filterTags },
          newFilterViewName: name,
          filterTags
        }
        updateFilterView(filterView)
      } else if (
        !nameEdited &&
        !isEqual(currentView.filterTags, selectedView.filterTags)
      ) {
        // filter tags changed
        const filterView = {
          oldFilterView: {
            filterViewName: currentViewName,
            filterTags: selectedView.filterTags
          },
          newFilterViewName: name,
          filterTags
        }
        updateFilterView(filterView)
      } else {
        const filterView = { filterViewName: name, filterTags }
        saveFilterView(filterView)
      }
      setSelectedView({ filterViewName: name, filterTags })
      setSaveDisabled(true)
      setIsNewView(false)
      setCurrentViewName(name)
      setNameEdited(false)
    }
  }

  const onDeleteFilterView = (id: number) => {
    deleteFilterView(filterViews[id])
  }

  const onDuplicateFilterView = (id: string) => {
    const selectedFilterView = filterViews.find(
      (fv) => fv.filterViewName === id
    )
    const copyFilterView = {
      ...selectedFilterView,
      filterViewName: `${selectedFilterView.filterViewName} (Copy)`
    }
    saveFilterView(copyFilterView)
  }

  const onSelectFilterView = (id) => {
    const selectedFilter = filterViews.find((fv) => fv.filterViewName === id)
    selectFilterView(selectedFilter)
    setCurrentViewName(selectedFilter.filterViewName)
    setSelectedView(selectedFilter)
    nameRef.current.value = selectedFilter.filterViewName
  }

  const addFilterView = () => {
    const newFilterView = defaultView
    selectFilterView(newFilterView)
    setIsNewView(true)
    setCurrentViewName(newFilterView.filterViewName)
    setSelectedView(newFilterView)
    nameRef.current.value = newFilterView.filterViewName
  }

  const editFilterSetName = () => {
    closeMenu() // if list were open when editing the filter view name, close it
    setNameEditable(!nameEditable)

    if (!nameEditable && window.getSelection) {
      // Selects/highlights name text after field is in focus
      const textInput = nameRef.current
      if (textInput) {
        textInput.focus()
        textInput.setSelectionRange(0, textInput.value.length)
      }
      setTimeout(() => {}, 0)
    }
  }

  const applyFilterViewNameEdit = (editedName) => {
    updateCurrentViewName(editedName)
    setNameEdited(true)
    setNameEditable(false)
    nameRef.current.blur()
    if (currentView.filterTags.length && isValidFilterViewName(editedName)) {
      setSaveDisabled(false)
    }
  }

  const onKeyboardEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      applyFilterViewNameEdit(`${e.currentTarget.value}`)

      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
      }
    }
  }

  const closeOnOutsideClick = () => {
    closeMenu()

    if (nameEditable) {
      applyFilterViewNameEdit(nameRef.current.value)
    }
  }

  useOutsideClick(listRef, closeOnOutsideClick)

  const sortedFilterViews = filterViews.sort((a, b) =>
    a.filterViewName &&
    b.filterViewName &&
    a.filterViewName.toLowerCase() > b.filterViewName.toLowerCase()
      ? 1
      : -1
  )

  return (
    <div className="filter-sets-list">
      <div ref={listRef} className="dashboard-mngr-filter-view-list_container">
        <Switch
          disabled={!currentView.filterTags.length}
          className="dashboard-mngr-filter-view-switch"
          data-testid="dashboard-mngr-filter-view-switch"
          checked={filterEnabled}
          onChange={() => toggleFilters(!filterEnabled)}
        />
        <div
          className="filter-view-selected"
          data-testid="filter-set-filter-view-selected"
        >
          <input
            type="text"
            className={cx("filter-set-item__title-text", {
              "filter-set-item__title-text--editable": nameEditable
            })}
            ref={nameRef}
            readOnly={!nameEditable}
            onKeyPress={onKeyboardEnter}
            onClick={toggleMenu}
            defaultValue={currentView.filterViewName}
          />
          <div
            className="dashhboard-mngr-filter-view-name-edit"
            onClick={editFilterSetName}
          >
            <IconComponent className="edit-icon" name="pencil" />
          </div>
        </div>

        <button
          className={`button dashboard-mngr-save-filter-view ${
            saveDisabled ? "disabled" : ""
          }`}
          aria-disabled={!currentView.filterTags.length}
          data-testid="dashboard-mngr-save-filter-view"
          onClick={() =>
            onSaveFilterView(currentView.filterViewName, currentView.filterTags)
          }
        >
          <IconSave />
        </button>
        <div
          className="dashhboard-mngr-filter-view-toggle-dropdown"
          data-testid="dashhboard-mngr-filter-view-toggle-dropdown"
          onClick={toggleMenu}
        >
          <IconComponent className="tick-icon" name="tick" />
        </div>
      </div>
      {listOpen && !nameEditable && (
        <div className="filter-view-list__items">
          <div className="filter-view-list__items-container">
            {sortedFilterViews.map((filterView, i) => (
              <FilterSetsListItem
                key={i}
                filterSetId={filterView.filterViewName}
                filterSetName={filterView.filterViewName}
                deleteFilterSet={() => onDeleteFilterView(i)}
                deleteTooltip={TOOLTIP_REMOVE}
                duplicateFilterSet={onDuplicateFilterView}
                duplicateTooltip={TOOLTIP_DUPLICATE}
                selectFilterSet={onSelectFilterView}
                closeList={closeMenu}
                showAdvancedFilterControls
                enableDeleteFilterSet
              />
            ))}
            <div className="filter-set-item" onClick={toggleMenu}>
              <div className="filter-set-item__title" onClick={addFilterView}>
                <div className="filter-set-item__title-text">{LABEL_ADD}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardManagerFilterView
