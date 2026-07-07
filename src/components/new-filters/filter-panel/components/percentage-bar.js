// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import "./percentage-bar.scss"

export default function PercentageBar({ total, partOfTotal }) {
  const progressBarStyle = () => {
    const ONE_HUNDRED = 100
    const percentOfTotal = (partOfTotal / total) * ONE_HUNDRED
    return {
      width: percentOfTotal <= ONE_HUNDRED ? `${percentOfTotal}%` : "100%"
    }
  }

  const shouldRender = () => partOfTotal !== null && total !== null

  return shouldRender() ? (
    <div className="percentage-bar">
      <div className="percentage-bar-inner" style={progressBarStyle()} />
    </div>
  ) : null
}

PercentageBar.propTypes = {
  total: PropTypes.number,
  partOfTotal: PropTypes.number
}
