// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Icon from "components/icon/icon"
import React from "react"
import PropTypes from "prop-types"

Lock.propTypes = {
  locked: PropTypes.bool.isRequired,
  onLockedChange: PropTypes.func.isRequired
}

export default function Lock({ locked, onLockedChange }) {
  const name = locked ? "lock" : "unlock"

  return (
    <div onClick={onLockedChange}>
      <Icon name={name} />
    </div>
  )
}
