// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { connect } from "react-redux"
import { Redirect, withRouter } from "react-router-dom"
import PropTypes from "prop-types"

const AuthProtected = ({ children, location, sessionValid }) => {
  if (sessionValid) {
    return children
  }
  // this is incredibly brittle, since it'll break if we add a new route.
  // but we ~need~ to do it like this or we risk matching old style links
  // like /dashboard/4121. Once we fully deprecate old links, we should re-tool
  // this to always assume the first param is the database.
  const match = location.pathname.match(
    "/([^/]+)/(?:dashboard|data-manager|tables|importer|sql-editor|settings|system-dashboards)"
  )

  const loginPath = match ? `/${match[1]}/login` : "/login"

  return (
    <Redirect
      {...{
        to: {
          pathname: loginPath,
          state: { from: location }
        }
      }}
    />
  )
}

AuthProtected.propTypes = {
  children: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  sessionValid: PropTypes.bool.isRequired,
  returnOnLogin: PropTypes.func
}

const mapStateToProps = (state) => ({ sessionValid: state.session.valid })

export default withRouter(connect(mapStateToProps)(AuthProtected))
