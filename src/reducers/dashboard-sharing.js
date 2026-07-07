// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import createReducer from "utils/redux/create-reducer"
import {
  GET_ALL_USERS_AND_ROLES,
  GET_DASHBOARD_GRANTEES,
  POPULATE_DASHBOARD_SHARED_USERS_LIST,
  UPDATE_DASHBOARD_SHARED_USERS_LIST,
  ADD_DASHBOARD_SHARED_USER,
  REMOVE_DASHBOARD_SHARED_USER,
  UPDATE_DASHBOARD_SHARE_AUTOSUGGEST_VALUE,
  UPDATE_DASHBOARD_SHARE_SUGGESTIONS
} from "constants/action-types"

const initialState = {
  allUsersAndRolesLoadState: {
    loading: false,
    complete: false,
    error: false
  },
  dashboardGranteesLoadState: {
    loading: false,
    complete: false,
    error: false
  },
  allUsersAndRoles: [],
  originalSharedUsersList: [],
  sharedUsersList: [],
  autosuggestValue: "",
  suggestions: []
}

const dashboardSharingReducers = {
  [`${GET_ALL_USERS_AND_ROLES}_PENDING`](state) {
    return {
      ...state,
      allUsersAndRolesLoadState: {
        ...state.allUsersAndRolesLoadState,
        loading: true
      }
    }
  },

  [`${GET_ALL_USERS_AND_ROLES}_ERROR`](state) {
    return {
      ...state,
      allUsersAndRolesLoadState: {
        ...state.allUsersAndRolesLoadState,
        error: true
      }
    }
  },

  [`${GET_ALL_USERS_AND_ROLES}_FULFILLED`](state, action) {
    const { users = [], roles = [] } = action.payload

    const allUsersAndRoles = [
      ...roles.sort().map((id) => ({
        id,
        type: "ROLE"
      })),
      ...users.sort().map((id) => ({ id, type: "USER" }))
    ]

    return {
      ...state,
      allUsersAndRolesLoadState: {
        ...state.allUsersAndRolesLoadState,
        loading: false,
        complete: true,
        error: false
      },
      allUsersAndRoles
    }
  },

  [`${GET_DASHBOARD_GRANTEES}_PENDING`](state) {
    return {
      ...state,
      allUsersAndRolesLoadState: {
        ...state.dashboardGranteesLoadState,
        loading: true
      }
    }
  },

  [`${GET_DASHBOARD_GRANTEES}_ERROR`](state) {
    return {
      ...state,
      allUsersAndRolesLoadState: {
        ...state.dashboardGranteesLoadState,
        error: true
      }
    }
  },

  [`${GET_DASHBOARD_GRANTEES}_FULFILLED`](state, action) {
    const sharedUsersList = action.payload.map(({ name, is_user }) => ({
      id: name,
      type: is_user ? "USER" : "ROLE"
    }))

    return {
      ...state,
      dashboardGranteesLoadState: {
        ...state.allUsersAndRolesLoadState,
        loading: false,
        complete: true,
        error: false
      },
      originalSharedUsersList: sharedUsersList,
      sharedUsersList
    }
  },

  [POPULATE_DASHBOARD_SHARED_USERS_LIST](state, action) {
    return {
      ...state,
      sharedUsersList: action.payload
    }
  },

  [ADD_DASHBOARD_SHARED_USER](state, action) {
    // don't pass user object by reference
    const newUser = { ...action.user }
    // make sure to not add the same user twice
    const userExists = state.sharedUsersList.find(
      (user) => user.id === newUser.id
    )
    return {
      ...state,
      sharedUsersList: userExists
        ? state.sharedUsersList
        : [...state.sharedUsersList, newUser]
    }
  },

  [REMOVE_DASHBOARD_SHARED_USER](state, action) {
    const oldUserId = action.user && action.user.id
    return {
      ...state,
      sharedUsersList: state.sharedUsersList.filter(
        (user) => user.id !== oldUserId
      )
    }
  },

  [UPDATE_DASHBOARD_SHARED_USERS_LIST](state, action) {
    return {
      ...state,
      sharedUsersList: action.payload
    }
  },

  [UPDATE_DASHBOARD_SHARE_AUTOSUGGEST_VALUE](state, action) {
    return {
      ...state,
      autosuggestValue: action.value
    }
  },

  [UPDATE_DASHBOARD_SHARE_SUGGESTIONS](state, action) {
    return {
      ...state,
      suggestions: action.payload
    }
  }
}

export default createReducer(dashboardSharingReducers, initialState)
