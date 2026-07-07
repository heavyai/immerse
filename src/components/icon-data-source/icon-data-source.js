// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Icon from "components/icon/icon"
import React from "react"
import PropTypes from "prop-types"

IconDataSource.propTypes = {
  alias: PropTypes.string,
  viewBox: PropTypes.string
}

export default function IconDataSource(props) {
  return (
    <div className="data-source-icon-container">
      <div>
        <Icon
          name={`${props.alias === "multi" ? "multi-source" : "data-source"}`}
          viewBox={props.viewBox}
        />
      </div>
      {props.alias !== "multi" && (
        <span className="data-source-alias">{props.alias}</span>
      )}
    </div>
  )
}
