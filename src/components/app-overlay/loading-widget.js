// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"

LoadingWidget.propTypes = {
  message: PropTypes.string
}

export default function LoadingWidget({ message }) {
  return (
    <div className="loading-widget" data-testid="loading-widget">
      <div className="loading-gfx">
        <div className="main-loading-icon" />
      </div>
      <div className="loading-msg">{message}</div>
    </div>
  )
}
