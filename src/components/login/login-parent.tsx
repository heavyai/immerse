// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import { initHeavyDBSession } from "actions/connection-action-creators"
import { ConnectionState, User } from "reducers/connection"
import Login from "./login"

const getLoginText = (
  user: User,
  loadLink: boolean,
  serversJsonPending: boolean
) => {
  if (loadLink) {
    return "Load Dashboard Link"
  } else if (serversJsonPending) {
    return "Login"
  } else if (user.customStyles && user.customStyles.loginText) {
    return user.customStyles.loginText
  }

  return "Login to Immerse"
}

export function mapStateToProps({
  connection: { user, loadLink, error, version, serversJsonPending }
}: {
  connection: ConnectionState
}) {
  return {
    user,
    error,
    shouldDisableDatabase: loadLink,
    titleName: getLoginText(user, loadLink, serversJsonPending),
    version
  }
}

function mapDispatchToProps(dispatch) {
  return {
    handleConnect: (config) => dispatch(initHeavyDBSession(config)),
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
