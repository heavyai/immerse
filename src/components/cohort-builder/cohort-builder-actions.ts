// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setFilterPanelViewMode } from "components/new-filters/filters-actions"
import { setFilterSetDimension } from "components/new-filters/filter-sets-action-creators"
import { getSelectedFilterSet } from "components/new-filters/filter-sets-selectors"

import { FILTER_PANEL_VIEWS } from "components/new-filters/filter-panel/constants"

export const SHOW_COHORT_BUILDER_MODAL = "SHOW_COHORT_BUILDER_MODAL"
export const HIDE_COHORT_BUILDER_MODAL = "HIDE_COHORT_BUILDER_MODAL"

export const showCohortBuilderModal = ({ isEditing = false } = {}) => ({
  type: SHOW_COHORT_BUILDER_MODAL,
  isEditing
})

export const hideCohortBuilderModal = () => ({
  type: HIDE_COHORT_BUILDER_MODAL
})

export const createCohort = (cohortData) => (dispatch, getState) => {
  const store = getState()
  const dataSource = cohortData.dataSource
  const dimension = cohortData.label
  const table = cohortData.table
  const selectedFilterSet = getSelectedFilterSet(store)
  dispatch(
    setFilterSetDimension(selectedFilterSet.id, dataSource, table, dimension)
  )
  dispatch(setFilterPanelViewMode(FILTER_PANEL_VIEWS.COHORT_BUILDER))
  dispatch(hideCohortBuilderModal())
}

export const editCohort = (cohortData) => (dispatch, getState) => {
  const store = getState()
  const dataSource = cohortData.dataSource
  const table = cohortData.table
  const dimension = cohortData.label
  const selectedFilterSet = getSelectedFilterSet(store)
  dispatch(
    setFilterSetDimension(selectedFilterSet.id, dataSource, table, dimension)
  )
  dispatch(hideCohortBuilderModal())
}
