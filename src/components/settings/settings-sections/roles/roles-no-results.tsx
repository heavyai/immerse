// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import IconGroup from "components/svg-icons/icon-roles-group"
import IconDash from "components/svg-icons/icon-roles-dash"

import "./styles.scss"

const RolesNoResults = () => {
  return (
    <div className="no-results-wrapper">
      <div className="icons-container">
        <span className="icon-group">
          <IconGroup />
        </span>
        <span className="icon-dash">
          <IconDash />
        </span>
      </div>
      <header className="no-results-text">
        <h1>No results match your criteria.</h1>
        <p>
          Make sure the role is spelled correctly or the role was added into
          your ecosystem.
        </p>
        <p>
          Visit{" "}
          <a
            href="https://docs.heavy.ai/installation-and-configuration/security/roles"
            target="_blank"
            rel="noreferrer"
          >
            HEAVY.AI docs
          </a>{" "}
          for information on roles &amp; privileges.
        </p>
      </header>
    </div>
  )
}

export default RolesNoResults
