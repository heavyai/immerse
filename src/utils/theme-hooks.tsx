// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createTheme } from "@material-ui/core/styles"
import { useEffect, useMemo, useState } from "react"
import { Theme, ThemeOptions } from "@material-ui/core"
import { useSelector } from "react-redux"
import { isThemeDark, useImmerseUITheme } from "./theme/use-immerse-ui-theme"

export const useServersJsonTheme = () => {
  const { customStyles } = useSelector((state) => state.connection.user)
  const { theme: immerseUITheme } = useImmerseUITheme()

  const defaultMuiThemeOptions: ThemeOptions = useMemo(
    () => ({
      palette: {
        primary: {
          main: "#0089D1"
        },
        type: isThemeDark(immerseUITheme) ? "dark" : "light"
      }
    }),
    [immerseUITheme]
  )

  const [theme, setTheme] = useState<Theme>(createTheme(defaultMuiThemeOptions))

  // Because serversJSONStyles is a user-set value, we want to be careful to
  // not blow up if they pass something unexpected in. For example, Material
  // doesn't allow named CSS values (e.g. "magenta") even though those would
  // normally be valid `customStyles` values
  useEffect(() => {
    try {
      setTheme(
        createTheme({
          ...defaultMuiThemeOptions,
          palette: {
            primary: {
              main: customStyles.buttonPrimaryColor
            },
            type: isThemeDark(immerseUITheme) ? "dark" : "light"
          }
        })
      )
    } catch (e) {
      setTheme(createTheme(defaultMuiThemeOptions))
    }
  }, [customStyles, immerseUITheme, defaultMuiThemeOptions])

  return theme
}
