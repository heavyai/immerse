// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import Icon from "components/icon/icon"

CustomCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired
}

export default function CustomCheckbox(props) {
  return (
    <button className="button custom-checkbox" onClick={props.onChange}>
      {!props.checked && <span className="empty-checkbox" />}
      {props.checked && <Icon name="check" />}
    </button>
  )
}
