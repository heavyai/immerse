// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dispatch } from "redux"
import {
  GET_ROLES_ERROR,
  GET_ROLES_REQUEST,
  GET_ROLES_SUCCESS,
  GET_USERS_ERROR,
  GET_USERS_REQUEST,
  GET_USERS_SUCCESS
} from "constants/action-types"
import Services from "services/immerse"
import { setAppError } from "actions/app-action-creators"
import { RoleMetadata, UserMetadata } from "components/settings/types"

const getUsersRequest = () => ({ type: GET_USERS_REQUEST })

const getUsersSuccess = (usersMetadata: UserMetadata[]) => ({
  type: GET_USERS_SUCCESS,
  payload: usersMetadata
})

const getUsersError = () => ({ type: GET_USERS_ERROR })

// TODO replace mocked metadata with new API when SIO-1235 is merged
const mockGetUsersMetadata = async () => {
  const DbCon = Services.get("DbCon")
  const users = await DbCon.getUsersAsync()

  const mockUsersWithMeta = users.map((name: string) => ({
    username: name,
    roles: []
  }))

  return mockUsersWithMeta
}

export const getUsersMetadata = () => async (dispatch: Dispatch) => {
  await dispatch(getUsersRequest())

  try {
    const usersMetadata = await mockGetUsersMetadata()
    await dispatch(getUsersSuccess(usersMetadata))
  } catch (e) {
    dispatch(setAppError(GET_USERS_ERROR, e))
    dispatch(getUsersError())
  }
}

const getRolesRequest = () => ({ type: GET_ROLES_REQUEST })

const getRolesSuccess = (rolesMetadata: RoleMetadata[]) => ({
  type: GET_ROLES_SUCCESS,
  payload: rolesMetadata
})

const getRolesError = () => ({ type: GET_ROLES_ERROR })

export const getRolesMetadata = () => async (dispatch: Dispatch) => {
  await dispatch(getRolesRequest())

  try {
    const DbCon = Services.get("DbCon")
    const roles = await DbCon.getRolesAsync()
    // This is optimistically mocked "metadata", as future control panel designs
    // involve displaying some role metadata (e.g.number of members). It should
    // be replaced with a new API.
    const rolesMetadata = roles.map((role: string) => ({
      name: role
    }))
    await dispatch(getRolesSuccess(rolesMetadata))
  } catch (e) {
    dispatch(setAppError(GET_ROLES_ERROR, e))
    dispatch(getRolesError())
  }
}
