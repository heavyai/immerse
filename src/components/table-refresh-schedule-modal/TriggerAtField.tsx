// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import MomentUtils from "@date-io/moment"
import { DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers"
import { TextField } from "widgets/text-field/TextField"
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles"
import IconDateTime from "components/svg-icons/icon-date-time"
import {
  isThemeDark,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

type TriggerAtFieldProps = {
  id: string
  value: Date | null
  onChange: (newDate: Date | null) => void
}

const primaryColor = "#0089D1"

const lightModeOverrides = {
  MuiPickersToolbar: {
    toolbar: {
      backgroundColor: "#fff"
    }
  },
  MuiPickersModal: {
    dialogRootWider: {
      border: "1px solid #454545"
    }
  },
  MuiPickerDTTabs: {
    tabs: {
      backgroundColor: "#fff"
    }
  },
  MuiPickersToolbarText: {
    toolbarTxt: {
      color: "#444"
    },
    toolbarBtnSelected: {
      color: "#444"
    }
  },
  MuiTabs: {
    indicator: {
      backgroundColor: primaryColor
    },
    flexContainer: {
      color: primaryColor
    }
  },
  MuiTouchRipple: {
    root: {
      display: "none"
    }
  },
  MuiPickersCalendarHeader: {
    switchHeader: {
      backgroundColor: "#fff",
      color: "#444"
    }
  }
}

const darkModeOverrides = {
  MuiPickersToolbar: {
    toolbar: {
      backgroundColor: "#424242"
    }
  },
  MuiPickersModal: {
    dialogRootWider: {
      border: "1px solid #454545"
    }
  },
  MuiTouchRipple: {
    root: {
      display: "none"
    }
  },
  MuiTabs: {
    indicator: {
      backgroundColor: "#0089D1"
    }
  },
  MuiPickersCalendarHeader: {
    switchHeader: {
      backgroundColor: "#424242",
      color: "#ccc"
    }
  }
}

const TriggerAtField: FC<TriggerAtFieldProps> = ({ id, value, onChange }) => {
  const [isDatepickerOpen, setIsDatepickerOpen] = useState(false)
  const { theme: immerseUITheme } = useImmerseUITheme()

  const theme = createTheme({
    palette: {
      primary: {
        main: "#0089D1"
      },
      type: isThemeDark(immerseUITheme) ? "dark" : "light"
    },
    overrides: isThemeDark(immerseUITheme)
      ? darkModeOverrides
      : lightModeOverrides
  })

  return (
    <MuiThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DateTimePicker
          id={id}
          style={{ width: "100%" }}
          open={isDatepickerOpen}
          onOpen={() => setIsDatepickerOpen(true)}
          onClose={() => setIsDatepickerOpen(false)}
          value={value}
          onChange={(datetimeMoment) =>
            onChange(datetimeMoment?.toDate() || null)
          }
          TextFieldComponent={(props) => (
            <TextField
              {...props}
              trailingIcon={
                <span onClick={() => setIsDatepickerOpen(true)}>
                  <IconDateTime />
                </span>
              }
            />
          )}
          format={"MMM DD YYYY HH:mm"}
        />
      </MuiPickersUtilsProvider>
    </MuiThemeProvider>
  )
}

export default TriggerAtField
