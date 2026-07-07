// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  HIDE_BANNER,
  HIDE_CLEAR_FILTERS_DROPDOWN,
  HIDE_MODAL,
  OPEN_DASHBOARD_SHARE_MODAL,
  OPEN_DASHBOARD_BULK_SHARE_MODAL,
  CLOSE_DASHBOARD_SHARE_MODAL,
  SELECTOR_PILL_HOVER,
  SELECTOR_PILL_NOT_HOVER,
  SET_SELECTOR_POSITION,
  SHOW_BANNER,
  SHOW_CLEAR_FILTERS_DROPDOWN,
  SHOW_DASHBOARD_IMPORT_MODAL,
  SHOW_MODAL,
  SHOW_DANGER_MODAL,
  HIDE_DANGER_MODAL,
  SHOW_WARNING_MODAL,
  HIDE_WARNING_MODAL,
  SHOW_INFO_MODAL,
  HIDE_INFO_MODAL,
  SET_FILTER_NEWLY_CREATED,
  UNSET_FILTER_NEWLY_CREATED,
  SET_CUSTOM_SQL_FILTER_VALIDATION_ERROR,
  SET_FILTER_PANEL_VIEW_MODE,
  MODAL_LOADING,
  MODAL_DONE,
  SHOW_REFRESH_MODAL,
  CLOSE_REFRESH_MODAL
} from "constants/action-types"

import {
  SHOW_CATEGORY_SELECTION_MODAL,
  HIDE_CATEGORY_SELECTION_MODAL,
  MAKE_CATEGORY_SELECTION
} from "actions/category-selection-modal-action-creators"

import { FILTER_PANEL_VIEWS } from "components/new-filters/filter-panel/constants"

import {
  OPEN_CUSTOM_SQL_MANAGER,
  CLOSE_CUSTOM_SQL_MANAGER
} from "components/custom-sql-manager/custom-sql-manager-actions"
import {
  OPEN_CUSTOM_SOURCE_MANAGER,
  CLOSE_CUSTOM_SOURCE_MANAGER
} from "components/custom-source-manager/custom-source-manager-actions"

import {
  OPEN_JOIN_MANAGER,
  CLOSE_JOIN_MANAGER
} from "components/join-manager/join-manager-actions"

import {
  SHOW_COHORT_BUILDER_MODAL,
  HIDE_COHORT_BUILDER_MODAL
} from "components/cohort-builder/cohort-builder-actions"

import { dropLast, ifElse, insert, lensProp, over, update } from "ramda"
import { CHARTS } from "constants/charts"
import createReducer from "utils/redux/create-reducer"
import { noop } from "utils/helpers"
import {
  DANGER as DANGER_MODAL_TYPE,
  WARNING as WARNING_MODAL_TYPE,
  INFO as INFO_MODAL_TYPE,
  DASHBOARD_MIGRATION as DASHBOARD_MIGRATION_TYPE,
  CUSTOM_SQL_MANAGER,
  CUSTOM_SOURCE_MANAGER,
  COHORT_BUILDER,
  PARAMETER_MANAGER,
  JOIN_MANAGER
} from "constants/modal-types"

import {
  SHOW_DASHBOARD_MIGRATION_MODAL,
  HIDE_DASHBOARD_MIGRATION_MODAL
} from "components/modals/dashboard-migration-modal/actions"

import {
  SHOW_PARAMETER_MANAGER_MODAL,
  HIDE_PARAMETER_MANAGER_MODAL
} from "components/parameter-manager/parameter-action-creators"

import { BULK_MIGRATE_CHARTS_START } from "components/migration/migration-actions"

export const initialState = {
  showClearFiltersDropdown: false,
  banner: {
    open: false,
    type: null
  },
  modal: {
    type: null,
    open: false,
    content: "",
    header: "",
    loading: null,
    closeOnAction: true,
    primaryAction: {
      text: "OK",
      action: noop
    },
    secondaryAction: {
      text: "CANCEL",
      action: noop
    }
  },
  selectorPillHover: {
    shouldShowPrompt: false,
    top: 0,
    message: ""
  },
  selectorPositions: {
    dimensions: [],
    measures: [],
    postFilters: []
  },
  categorySelector: {
    selections: [],
    onApplyAction: {}
  },
  filters: {
    filterEditing: {},
    newlyCreated: {}
  },
  filterPanel: {
    viewMode: FILTER_PANEL_VIEWS.FILTER_SETS
  },
  helpCenterOpen: false
}

function requiredDataType(chartType, selectorType, index) {
  return CHARTS[chartType][selectorType][index]
    ? CHARTS[chartType][selectorType][index].typeName
    : ""
}

function pillHasPrompt(selector) {
  return (
    selector && ((selector.isRequired && !selector.label) || selector.isError)
  )
}

function createPillPrompt({
  chartType,
  selectorType,
  isError,
  custom,
  value,
  index
}) {
  if (selectorType === "measures" && isError && custom && !value) {
    return "Custom measure cannot be blank"
  } else {
    const typeName = requiredDataType(chartType, selectorType, index)
    return `Required ${isError ? typeName || "a valid" : ""} ${dropLast(
      1,
      selectorType
    )}`
  }
}

function updatePosition(index, position) {
  return ifElse(
    (selectors) => typeof selectors.index === "undefined",
    insert(index, position),
    update(index, position)
  )
}

const UIReducers = {
  [HIDE_CLEAR_FILTERS_DROPDOWN](state) {
    return Object.assign({}, state, {
      showClearFiltersDropdown: false
    })
  },

  [SHOW_CLEAR_FILTERS_DROPDOWN](state) {
    return Object.assign({}, state, {
      showClearFiltersDropdown: true
    })
  },

  [HIDE_MODAL](state) {
    return Object.assign({}, state, {
      modal: initialState.modal
    })
  },

  [SHOW_MODAL](
    state,
    {
      modalType: type,
      className,
      content,
      heading,
      closeOnAction = true,
      hideCloseIcon = false,
      primaryAction,
      secondaryAction
    }
  ) {
    return Object.assign({}, state, {
      modal: {
        open: true,
        loading: null,
        type,
        className,
        content,
        heading,
        closeOnAction,
        hideCloseIcon,
        primaryAction,
        secondaryAction
      }
    })
  },

  [MODAL_LOADING](state, { optionalText }) {
    return {
      ...state,
      modal: {
        ...state.modal,
        loading: optionalText || "Loading..."
      }
    }
  },

  [MODAL_DONE](state) {
    return {
      ...state,
      modal: {
        ...state.modal,
        loading: null
      }
    }
  },

  [SHOW_REFRESH_MODAL](state) {
    return {
      ...state,
      refreshModal: true
    }
  },

  [CLOSE_REFRESH_MODAL](state) {
    return {
      ...state,
      refreshModal: false
    }
  },

  [SET_SELECTOR_POSITION](state, { index, selectorType, position }) {
    return over(
      lensProp("selectorPositions"),
      over(lensProp(selectorType), updatePosition(index, position))
    )(state)
  },

  [SELECTOR_PILL_HOVER](state, { selector, top }) {
    const shouldShowPrompt = pillHasPrompt(selector)
    return Object.assign({}, state, {
      selectorPillHover: {
        shouldShowPrompt,
        message: shouldShowPrompt
          ? createPillPrompt(selector)
          : state.selectorPillHover.message,
        top: shouldShowPrompt ? top : state.selectorPillHover.top
      }
    })
  },

  [SELECTOR_PILL_NOT_HOVER](state) {
    return Object.assign({}, state, {
      selectorPillHover: Object.assign({}, state.selectorPillHover, {
        shouldShowPrompt: false
      })
    })
  },

  [SHOW_DANGER_MODAL]: (
    state,
    { className, title, message, primaryAction, secondaryAction }
  ) => ({
    ...state,
    modal: {
      ...state.modal,
      open: true,
      loading: null,
      type: DANGER_MODAL_TYPE,
      className,
      title,
      message,
      primaryAction,
      secondaryAction
    }
  }),
  [HIDE_DANGER_MODAL]: (state) => ({
    ...state,
    modal: initialState.modal
  }),

  [SHOW_WARNING_MODAL]: (
    state,
    { className, title, message, primaryAction, secondaryAction }
  ) => ({
    ...state,
    modal: {
      ...state.modal,
      open: true,
      loading: null,
      type: WARNING_MODAL_TYPE,
      className,
      title,
      message,
      primaryAction,
      secondaryAction
    }
  }),
  [HIDE_WARNING_MODAL]: (state) => ({
    ...state,
    modal: initialState.modal
  }),

  [SHOW_DASHBOARD_IMPORT_MODAL](state) {
    return Object.assign({}, state, {
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: "DASHBOARD_IMPORT"
      }
    })
  },

  [SHOW_INFO_MODAL]: (
    state,
    { hideCloseIcon, title, message, primaryAction }
  ) => ({
    ...state,
    modal: {
      ...state.modal,
      open: true,
      loading: null,
      type: INFO_MODAL_TYPE,
      hideCloseIcon,
      title,
      message,
      primaryAction
    }
  }),
  [HIDE_INFO_MODAL]: (state) => ({
    ...state,
    modal: initialState.modal
  }),

  [OPEN_DASHBOARD_SHARE_MODAL](state) {
    return Object.assign({}, state, {
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: "DASHBOARD_SHARING"
      }
    })
  },

  [OPEN_DASHBOARD_BULK_SHARE_MODAL](state) {
    return Object.assign({}, state, {
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: "DASHBOARD_BULK_SHARING"
      }
    })
  },

  [CLOSE_DASHBOARD_SHARE_MODAL](state) {
    return Object.assign({}, state, {
      modal: initialState.modal
    })
  },

  [OPEN_CUSTOM_SQL_MANAGER](state, { filter = {}, customSQLManagerProps }) {
    return {
      ...state,
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: CUSTOM_SQL_MANAGER
      },
      filters: {
        ...state.filters,
        filterEditing: filter
      },
      customSQLManagerProps,
      customSQLFilterError: ""
    }
  },

  [CLOSE_CUSTOM_SQL_MANAGER](state) {
    const newState = {
      ...state,
      modal: {
        ...state.modal,
        open: false,
        type: null
      },
      customSQLManagerProps: {},
      filters: {
        ...state.filters,
        filterEditing: {}
      }
    }
    return newState
  },

  [OPEN_CUSTOM_SOURCE_MANAGER](state, { customSourceManagerProps }) {
    return {
      ...state,
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: CUSTOM_SOURCE_MANAGER
      },
      customSourceManagerProps
    }
  },

  [CLOSE_CUSTOM_SOURCE_MANAGER]: (state) => ({
    ...state,
    modal: initialState.modal,
    customSourceManagerProps: {}
  }),

  [OPEN_JOIN_MANAGER](state, { joinManagerProps }) {
    return {
      ...state,
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: JOIN_MANAGER
      },
      joinManagerProps
    }
  },

  [CLOSE_JOIN_MANAGER]: (state) => ({
    ...state,
    modal:
      state.modal?.type === JOIN_MANAGER ? initialState.modal : state.modal,
    joinManagerProps: {}
  }),

  [SHOW_BANNER](state, action) {
    return Object.assign({}, state, {
      banner: {
        open: true,
        type: action.bannerType
      }
    })
  },

  [HIDE_BANNER](state) {
    return Object.assign({}, state, {
      banner: {
        open: false,
        type: null
      }
    })
  },

  [SHOW_CATEGORY_SELECTION_MODAL](
    state,
    { dataSource, column, onApplyAction, previousSelections, modalTitle }
  ) {
    return {
      ...state,
      modal: {
        open: true,
        loading: null,
        type: "CATEGORY_SELECTION",
        dataSource,
        column,
        onApplyAction,
        previousSelections,
        modalTitle
      },
      // these are the selections that are saved by the category selector. Reset
      // them every time the modal opens.
      categorySelector: {
        selections: [],
        onApplyAction: {}
      }
    }
  },

  [HIDE_CATEGORY_SELECTION_MODAL](state) {
    return {
      ...state,
      modal: initialState.modal
    }
  },

  [MAKE_CATEGORY_SELECTION](state, { selections, onApplyAction }) {
    return {
      ...state,
      categorySelector: {
        selections,
        onApplyAction
      }
    }
  },

  [SET_FILTER_NEWLY_CREATED](state, { name }) {
    return Object.assign({}, state, {
      ...state,
      filters: {
        ...state.filters,
        newlyCreated: {
          ...state.filters.newlyCreated,
          [name]: true
        }
      }
    })
  },

  [UNSET_FILTER_NEWLY_CREATED](state, { name }) {
    const newFilters = { ...state.filters.newlyCreated }
    delete newFilters[name]

    return Object.assign({}, state, {
      ...state,
      filters: {
        ...state.filters,
        newlyCreated: newFilters
      }
    })
  },

  [SET_CUSTOM_SQL_FILTER_VALIDATION_ERROR](state, { error }) {
    return {
      ...state,
      customSQLFilterError: error
    }
  },

  [SET_FILTER_PANEL_VIEW_MODE](state, { viewMode }) {
    return {
      ...state,
      filterPanel: {
        viewMode
      }
    }
  },

  [SHOW_DASHBOARD_MIGRATION_MODAL](state) {
    return {
      ...state,
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: DASHBOARD_MIGRATION_TYPE
      }
    }
  },

  [HIDE_DASHBOARD_MIGRATION_MODAL](state) {
    return {
      ...state,
      modal: initialState.modal
    }
  },

  [SHOW_COHORT_BUILDER_MODAL](state, { isEditing }) {
    return {
      ...state,
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: COHORT_BUILDER,
        cohortBuilderProps: {
          isEditing
        }
      }
    }
  },

  [HIDE_COHORT_BUILDER_MODAL](state) {
    return {
      ...state,
      modal: initialState.modal
    }
  },

  [SHOW_PARAMETER_MANAGER_MODAL](state, { parameterOnOpen }) {
    return {
      ...state,
      modal: {
        ...state.modal,
        open: true,
        loading: null,
        type: PARAMETER_MANAGER,
        parameterManagerProps: {
          parameterOnOpen
        }
      }
    }
  },

  [HIDE_PARAMETER_MANAGER_MODAL](state) {
    return {
      ...state,
      modal: initialState.modal
    }
  },

  [BULK_MIGRATE_CHARTS_START](state) {
    return {
      ...state,
      modal: {
        ...state.modal,
        migrationInProgress: true
      }
    }
  }
}

export default createReducer(UIReducers, initialState)
