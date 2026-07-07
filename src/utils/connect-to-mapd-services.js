// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import compose from "recompose/compose"
import getContext from "recompose/getContext"
import getDisplayName from "recompose/getDisplayName"
import PropTypes from "prop-types"
import setDisplayName from "recompose/setDisplayName"

export default function connectToMapDServices(BaseComponent) {
  return compose(
    setDisplayName(`MapD(${getDisplayName(BaseComponent)})`),
    getContext({ MapD: PropTypes.object })
  )(BaseComponent)
}
