// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import { ThemeProvider } from "@material-ui/core"
import { useServersJsonTheme } from "./theme-hooks"

export const withMuiTheme = (Component) => (props) => {
  const theme = useServersJsonTheme()
  return (
    <ThemeProvider theme={theme}>
      <Component {...props} />
    </ThemeProvider>
  )
}
