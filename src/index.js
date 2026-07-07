// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import "styles"
import React from "react"
import ReactDOM from "react-dom"
import AppRoot from "./containers/application-root"
import "./startup"

const target = document.getElementById("root")

ReactDOM.render(
  <AppRoot
    {...{
      debug: true,
      debugExternal: false
    }}
  />,
  target
)
