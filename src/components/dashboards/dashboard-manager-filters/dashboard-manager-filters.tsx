// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from "react"
import cx from "classnames"
import DashboardManagerFilterTags from "./dashboard-manager-filter-tags"
import {
  FilterTag,
  FilterView,
  FrontEndViewShape,
  UpdateFilterView
} from "./dashboard-manager-filter-types"
import DashboardManagerFilterView from "./DashboardManagerFilterView"
import "./styles.scss"
import { isEmpty, isEqual } from "lodash"
import {
  retrieveFromLocalStorage,
  storeInLocalStorage
} from "utils/local-storage"

export const defaultView = { filterViewName: "Unsaved view", filterTags: [] }

type OwnProps = {
  list: FrontEndViewShape[]
  updateFilters: (filters: FilterTag[]) => void
  toggleFilter: (toggleState: boolean) => void
  filterEnabled: boolean
  database: string
  username: string
}

/**
 * Retrieves entire dashboardsMgnFilterViews object from local storage in JSON form
 */
export function getAllDMFilterViews() {
  return retrieveFromLocalStorage("dashboardsMgnFilterViews")
}

/**
 * Returns parsed views only for current database and user
 * Ex: [{filterViewName: name, filterTags: [{owner: ownerName}, {source: sourceName}]}]
 * @param database
 */
function getDMParsedFilterViews(database: string, username: string) {
  const allFilters = getAllDMFilterViews()
  const databaseFilters = !isEmpty(allFilters)
    ? JSON.parse(allFilters)[database]
    : {}

  // At this point, we either have an old filters object (views stored directly
  // under database key as { views, currentFilterView }), or the views keyed by
  // user ({ username: { views, currentFilterView }}).
  // We assume any old/unassigned filters belong to the current user, update
  // local storage to reflect that, and return those unassigned filters.
  if (
    username &&
    !isEmpty(databaseFilters) &&
    !isAssignedToUser(databaseFilters)
  ) {
    migrateOrphanFilters(databaseFilters, database, username)
    return databaseFilters.views
  }
  return databaseFilters?.[username]?.views || []
}

/**
 * Old filter objects are not assigned to a user and store the dashboard filter
 * views directly on the database key.
 * @param filtersObj The property stored directly under the database key
 * */
function isAssignedToUser(filtersObj) {
  return (
    !filtersObj.hasOwnProperty("views") &&
    !filtersObj.hasOwnProperty("currentFilterView")
  )
}

/**
 * Updates the filter views shape in local storage to include the username of
 * the current user. (This will assign old filter views to the first user who
 * logs into the matching database)
 */
function migrateOrphanFilters(
  filterViews: any,
  database: string,
  username: string
) {
  const allFilters = getAllDMFilterViews()
  const parsedFilters = !isEmpty(allFilters) ? JSON.parse(allFilters) : {}

  setDMFilterViews({
    ...parsedFilters,
    [database]: {
      [username]: filterViews
    }
  })
}

/**
 * Returns object that has views and currentFilterView information for the current database
 * Ex: {currentFilterView: "last_selected_view", views: [{filterViewName: name, filterTags: [{owner: ownerName}, {source: sourceName}]}]}
 * @param database
 */
function getDMFilterParsedAll() {
  const allFilters = getAllDMFilterViews()
  return !isEmpty(allFilters) ? JSON.parse(allFilters) : {}
}

/**
 * Returns the currentFilterView (last selected view) from all filter views within the database
 * If there is no currentFilterView set, we will return the default filterView
 * @param filterViews
 * @param database
 * @param username
 */
function getCurrentFilterView(
  filterViews: FilterView[],
  database: string,
  username: string
) {
  const savedDashboardsMgnFilters = getDMFilterParsedAll()
  const filtersForDatabaseAndUser =
    savedDashboardsMgnFilters[database]?.[username]
  return filtersForDatabaseAndUser &&
    filtersForDatabaseAndUser.views &&
    filtersForDatabaseAndUser.views.length &&
    filtersForDatabaseAndUser.currentFilterView
    ? filterViews.find(
        (fv: { filterViewName: any }) =>
          fv.filterViewName === filtersForDatabaseAndUser.currentFilterView
      )
    : defaultView
}

/**
 * Saves the entire dashboardsMgnFilterViews object in the localStorage
 * @param databaseFilterViews
 */
function setDMFilterViews(databaseFilterViews) {
  storeInLocalStorage(
    "dashboardsMgnFilterViews",
    JSON.stringify(databaseFilterViews)
  )
}

/**
 * Updates the currently selected filter view
 * @param filterViewName
 * @param database
 * @param username
 */
function setDMCurrentFilterView(
  filterViewName: string,
  database: string,
  username: string
) {
  const allFilters = getDMFilterParsedAll()
  const parsedFiltersForDatabaseUser = allFilters[database]?.[username]
  parsedFiltersForDatabaseUser.currentFilterView = filterViewName
  setDMFilterViews(allFilters)
}

/**
 * Saves a new filter view, or updates the view if filter tag changes
 * @param filterView
 * @param database
 * @param username
 */
function saveDMFilterView(
  filterView: FilterView,
  database: string,
  username: string
) {
  const allFilters = getDMFilterParsedAll()

  const parsedFilters =
    !isEmpty(allFilters) && allFilters[database]?.[username]
      ? allFilters[database][username]
      : {}

  if (!parsedFilters.views) {
    parsedFilters.views = []
    parsedFilters.currentFilterView = null
  }

  const views = [...parsedFilters.views, filterView]

  allFilters[database] = {
    ...allFilters[database],
    [username]: {
      views,
      currentFilterView: filterView.filterViewName
    }
  }

  setDMFilterViews(allFilters)

  return views
}

/**
 * Updates filterView, called when either filter view name or filter tags changes
 * @param updateFilterView
 * @param database
 */
function updateDMFilterViewName(
  updateFilterView: UpdateFilterView,
  database: string,
  username: string
) {
  const allFilters = getDMFilterParsedAll()
  const parsedFilters =
    !isEmpty(allFilters) && allFilters[database]?.[username]
      ? allFilters[database][username]
      : {}

  if (
    parsedFilters.views &&
    parsedFilters.views.find((sfv) =>
      isEqual(sfv, updateFilterView.oldFilterView)
    )
  ) {
    const removeFilterIndex = parsedFilters.views.findIndex((sv) =>
      isEqual(sv, updateFilterView.oldFilterView)
    )

    if (removeFilterIndex > -1) {
      parsedFilters.views.splice(removeFilterIndex, 1)
    }

    const filterView = {
      filterViewName: updateFilterView.newFilterViewName,
      filterTags: updateFilterView.filterTags
    }
    parsedFilters.views.push(filterView)
    parsedFilters.currentFilterView = filterView.filterViewName
    setDMFilterViews(allFilters)
  }
  return parsedFilters.views || []
}

/**
 * Removes a filterView
 * @param filterView
 * @param database
 */
function deleteDMFilterView(
  filterView: FilterView,
  database: string,
  username: string
) {
  const allFilters = getDMFilterParsedAll()
  const parsedFilters =
    !isEmpty(allFilters) && allFilters[database]?.[username]
      ? allFilters[database][username]
      : {}
  if (
    parsedFilters.views &&
    parsedFilters.views.find((sfv) => isEqual(sfv, filterView))
  ) {
    const removeFilterIndex = parsedFilters.views.findIndex((sv) =>
      isEqual(sv, filterView)
    )

    if (removeFilterIndex > -1) {
      parsedFilters.views.splice(removeFilterIndex, 1)
    }

    if (filterView.filterViewName === parsedFilters.currentFilterView) {
      // if user deletes the currently selected filter view, make the selected view to default empty view
      parsedFilters.currentFilterView = null
    }
    setDMFilterViews(allFilters)
  }
  return parsedFilters.views
}

const DashboardManagerFiltersComponent: FC<OwnProps> = ({
  list,
  updateFilters,
  toggleFilter,
  filterEnabled,
  database,
  subComponents,
  username
}) => {
  const [filterViews, setFilterViews] = useState(
    getDMParsedFilterViews(database, username)
  )
  const [currentView, setCurrentView] = useState(
    getCurrentFilterView(filterViews, database, username)
  )

  const [currentDBname, setCurrentDBname] = useState(database)

  useEffect(() => {
    const currentDatabaseFilterViews = getDMParsedFilterViews(
      database,
      username
    )
    setFilterViews(currentDatabaseFilterViews)
    const filterView = getCurrentFilterView(
      currentDatabaseFilterViews,
      database,
      username
    )
    setCurrentView(filterView)
    setCurrentDBname(database)
    updateFilters(filterView.filterTags)
  }, [database, updateFilters, username])

  useEffect(() => {
    if (currentView) {
      setCurrentView(currentView)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView.filterViewName]) // filter tags changes tracked separately

  // should be called only during initial render
  useEffect(() => {
    updateFilters(currentView.filterTags)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onAddFilterTag = (filterTag: FilterTag) => {
    // Only allow one filter of each type. Adding a second filter of a given
    // type replaces existing tag.
    const newFilterTags = (currentView.filterTags || [])
      .slice()
      .filter(
        (existingTag) =>
          Object.keys(existingTag)[0] !== Object.keys(filterTag)[0]
      )

    // Filter tags are ordered by last edited
    newFilterTags.unshift(filterTag)

    const newFilterView = { ...currentView, filterTags: newFilterTags }
    setCurrentView(newFilterView)
    updateFilters(newFilterTags)
  }

  const onRemoveFilterTag = (filterTag: FilterTag) => {
    const newFilterTags = currentView.filterTags.filter(
      (ft: FilterTag) => ft !== filterTag
    )
    const newFilterView = { ...currentView, filterTags: newFilterTags }
    setCurrentView(newFilterView)
    updateFilters(newFilterTags)
  }

  const onUpdateCurrentViewName = (newName: string) => {
    const newFilterView = { ...currentView, filterViewName: newName }
    setCurrentView(newFilterView)
  }

  const onSelectFilterView = (selectedFilterView: FilterView) => {
    setCurrentView(selectedFilterView)
    updateFilters(selectedFilterView.filterTags)
    if (
      selectedFilterView.filterTags.length &&
      selectedFilterView.filterViewName
    ) {
      setDMCurrentFilterView(
        selectedFilterView.filterViewName,
        database,
        username
      )
    }
  }

  const onSaveFilterView = (saveFilterView: FilterView) => {
    const updatedFilterViews = saveDMFilterView(
      saveFilterView,
      database,
      username
    )
    setFilterViews(updatedFilterViews)
  }

  const onUpdateFilterView = (updateFilterView: UpdateFilterView) => {
    const updatedFilterViews = updateDMFilterViewName(
      updateFilterView,
      database,
      username
    )
    setFilterViews(updatedFilterViews)
  }

  const onDeleteFilterView = (deleteFilterView: FilterView) => {
    const updatedFilterViews = deleteDMFilterView(
      deleteFilterView,
      database,
      username
    )
    setFilterViews(updatedFilterViews)
    const filterView = getCurrentFilterView(
      updatedFilterViews,
      database,
      username
    )
    setCurrentView(filterView)
    updateFilters(filterView.filterTags)
  }

  return (
    <div
      className={cx("dashboard-manager-filters-panel", {
        expanded: currentView?.filterTags.length
      })}
    >
      <DashboardManagerFilterView
        filterViews={filterViews}
        currentView={currentView}
        toggleFilters={toggleFilter}
        filterEnabled={filterEnabled}
        saveFilterView={onSaveFilterView}
        updateFilterView={onUpdateFilterView}
        selectFilterView={onSelectFilterView}
        deleteFilterView={onDeleteFilterView}
        updateCurrentViewName={onUpdateCurrentViewName}
        currentDBname={currentDBname}
        username={username}
      />
      <DashboardManagerFilterTags
        filterTags={currentView.filterTags}
        list={list}
        addFilterTag={onAddFilterTag}
        removeFilterTag={onRemoveFilterTag}
      />
      {subComponents}
    </div>
  )
}

export default DashboardManagerFiltersComponent
