// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import { Link } from "react-router-dom"

interface LoggedOutProps {
  SAMLurl: string
  dispatch: Function
}

const LogBackInButton: React.FunctionComponent = () => (
  <button className="button primary">Log In</button>
)

const LogBackInLinkedButton: React.FunctionComponent = ({ SAMLurl }) =>
  SAMLurl ? (
    <a {...{ href: SAMLurl }}>
      <LogBackInButton />
    </a>
  ) : (
    <Link {...{ to: "/login" }}>
      <LogBackInButton />
    </Link>
  )

const LoggedOut: React.FunctionComponent<LoggedOutProps> = ({ SAMLurl }) => (
  <div className="logged-out" data-testid="logged-out">
    <div className="logged-out-modal">
      <div className="header">Log In</div>
      <div className="content">
        You have logged out. To start a new session simply log in when you are
        ready.
      </div>
      <div className="footer">
        <LogBackInLinkedButton {...{ SAMLurl }} />
      </div>
    </div>
  </div>
)

export default LoggedOut
