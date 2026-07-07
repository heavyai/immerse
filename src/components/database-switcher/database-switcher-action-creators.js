// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { exchangeSession } from "services/session"
import { UPDATE_SESSION_INFO } from "constants/action-types"
import { push } from "connected-react-router"
import { routeToDashboardsList } from "../../utils/routerPath"
import { handleGetUserRoles } from "../../actions/connection-action-creators"
import { getUserPrivileges } from "../../actions/privileges-thunks"

export const exchangeSessionAction = (dbName) => async (dispatch) => {
  const exchangeResp = await exchangeSession(dbName)
  const sessionInfo = await exchangeResp.json()
  await dispatch({
    type: UPDATE_SESSION_INFO,
    sessionInfo
  })
  await dispatch(handleGetUserRoles(sessionInfo.is_super))
  await dispatch(getUserPrivileges(sessionInfo.database))
  dispatch(push(routeToDashboardsList(dbName)))
}
