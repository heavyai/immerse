// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import PropTypes from "prop-types"
import { Dispatch } from "redux"

import { topnSetManualSelection } from "vega/actions/top-n-action-creators"

import { VegaCustomizableTopNOptions } from "vega/charts/types"

export const SHOW_CATEGORY_SELECTION_MODAL = "SHOW_CATEGORY_SELECTION_MODAL"
export const HIDE_CATEGORY_SELECTION_MODAL = "HIDE_CATEGORY_SELECTION_MODAL"
export const MAKE_CATEGORY_SELECTION = "MAKE_CATEGORY_SELECTION"

// On Apply Actions. Modal selections can be set to apply to:
// 1. A filter
// 2. A measure's Top N selections
export enum OnApplyActionTypes {
  APPLY_TO_FILTER = "APPLY_TO_FILTER",
  APPLY_TO_TOP_N = "APPLY_TO_TOP_N"
}

export type ApplyToFilterOptions = {
  type: OnApplyActionTypes.APPLY_TO_FILTER
  filterName: string
}

export type ApplyToTopNOptions = {
  type: OnApplyActionTypes.APPLY_TO_TOP_N
  chartId: string
  layerId: string
  propertyName: string
  topNData: Record<string, any>[]
  topNOptions: VegaCustomizableTopNOptions
}

export type OnApplyAction = ApplyToFilterOptions | ApplyToTopNOptions

export type CategorySelectorSelections = {
  selections: string[]
  onApplyAction: OnApplyAction
}

// Proptype version of CategorySelectorSelections for components that haven't
// been converted to typescript
export const CategorySelectionsPropType = PropTypes.shape({
  selections: PropTypes.arrayOf(PropTypes.string),
  onApplyAction: PropTypes.oneOfType([
    PropTypes.shape({
      type: PropTypes.oneOf([OnApplyActionTypes.APPLY_TO_FILTER]),
      filterName: PropTypes.string
    }),
    PropTypes.shape({
      type: PropTypes.oneOf([OnApplyActionTypes.APPLY_TO_TOP_N]),
      dimension: PropTypes.object
    })
  ])
})

export const openCategorySelectionModal = (
  dataSource: string,
  column: string,
  onApplyAction: OnApplyAction,
  previousSelections?: string[],
  modalTitle?: string
) => ({
  type: SHOW_CATEGORY_SELECTION_MODAL,
  dataSource,
  column,
  onApplyAction,
  previousSelections,
  modalTitle
})

export const hideCategorySelectionModal = () => ({
  type: HIDE_CATEGORY_SELECTION_MODAL
})

// Mostly used to make category selections after closing the category selection
// modal, but also used elsewhere to set arbitrary values
export const makeCategorySelection = (
  selections: string[],
  onApplyAction: OnApplyAction
) => (dispatch: Dispatch) => {
  // Filters read the onApplyAction from redux using componentDidUpdate
  dispatch({
    type: MAKE_CATEGORY_SELECTION,
    selections,
    onApplyAction
  })

  // For topN and future components using the category selection modal, dispatch
  // onApply actions here
  switch (onApplyAction.type) {
    case OnApplyActionTypes.APPLY_TO_TOP_N:
      dispatch(
        topnSetManualSelection(
          onApplyAction.chartId,
          onApplyAction.layerId,
          onApplyAction.propertyName,
          selections,
          onApplyAction.topNData,
          onApplyAction.topNOptions
        )
      )
      break
    default:
      break
  }
}
