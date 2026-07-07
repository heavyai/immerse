// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  GET_ROLES_ERROR,
  GET_ROLES_REQUEST,
  GET_ROLES_SUCCESS,
  GET_USERS_ERROR,
  GET_USERS_REQUEST,
  GET_USERS_SUCCESS
} from "constants/action-types"
import createReducer from "utils/redux/create-reducer"
import {
  RoleMetadata,
  SettingsState,
  UserMetadata
} from "components/settings/types"

const initialState = {
  users: { loading: false, metadata: [] },
  roles: { loading: false, metadata: [] }
}

const reducer = {
  [GET_USERS_SUCCESS](
    state: SettingsState,
    { payload }: { payload: UserMetadata }
  ) {
    return {
      ...state,
      users: {
        loading: false,
        metadata: payload
      }
    }
  },
  [GET_USERS_REQUEST](state: SettingsState) {
    return {
      ...state,
      users: {
        ...state.users,
        loading: true
      }
    }
  },
  [GET_USERS_ERROR](state: SettingsState) {
    return {
      ...state,
      users: {
        ...state.users,
        loading: false
      }
    }
  },
  [GET_ROLES_SUCCESS](
    state: SettingsState,
    { payload }: { payload: RoleMetadata[] }
  ) {
    return {
      ...state,
      roles: {
        loading: false,
        metadata: payload
      }
    }
  },
  [GET_ROLES_REQUEST](state: SettingsState) {
    return {
      ...state,
      roles: {
        ...state.roles,
        loading: true
      }
    }
  },
  [GET_ROLES_ERROR](state: SettingsState) {
    return {
      ...state,
      roles: {
        ...state.roles,
        loading: false
      }
    }
  }
}

export default createReducer(reducer, initialState)
