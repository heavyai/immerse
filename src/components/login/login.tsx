// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { Redirect } from "react-router-dom"
import LoginPanel from "./login-panel"

interface LoginProps {
  error: string | boolean
  handleConnect: (e: React.EventHandler<React.SyntheticEvent>) => void
  shouldDisableDatabase: boolean
  titleName: string
  user: User
  dispatch: Function
  version: string
}

class Login extends React.PureComponent<LoginProps, {}> {
  render() {
    const databaseParam = (this.props.match.params || {}).database
    const login_panel_databases = this.props.user.login_panel_databases || []

    const shouldDisableDatabase =
      databaseParam !== undefined || this.props.shouldDisableDatabase

    if (
      databaseParam !== undefined &&
      login_panel_databases.length &&
      !login_panel_databases.some((v) => v === databaseParam)
    ) {
      return <Redirect to="/login" />
    }

    return (
      <div className="login" data-testid="login-wrapper">
        <div className="login-container">
          <LoginPanel
            error={this.props.error}
            handleConnect={this.props.handleConnect}
            shouldDisableDatabase={shouldDisableDatabase}
            titleName={this.props.titleName}
            user={this.props.user}
            isDisabled={false}
            login_panel_databases={login_panel_databases}
            databaseParam={databaseParam}
          />
        </div>
      </div>
    )
  }
}

export default Login
