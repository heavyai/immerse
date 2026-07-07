// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useContext } from "react"
import { useSelector, useDispatch } from "react-redux"
import { NavLink, useHistory } from "react-router-dom"

import { SimpleWarningDialog } from "widgets/dialog/Dialog"
import { SettingsContext } from "./settings-context"
import { useSettingsPath } from "./routing/useSettingsPath"
import { setCurrentThemeAsync } from "utils/dark-mode-switcher"
import { resetThemeTint } from "actions/user-configurable-ui-action-creators"
import { ImmerseUITheme } from "utils/theme/types"
import { useImmerseUITheme } from "utils/theme/use-immerse-ui-theme"

const SettingsNavItem = ({
  settingsSection,
  label
}: {
  settingsSection: string
  label: string
}) => {
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const { hasUnsavedChanges, setHasUnsavedChanges } = useContext(
    SettingsContext
  )
  const { setTheme, savedTheme } = useImmerseUITheme()
  const history = useHistory()
  const settingsPath = useSettingsPath({ settingsSection })
  const dispatch = useDispatch()

  const handleClick = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault()
      setShowWarningDialog(true)
    } else {
      history.push(settingsPath)
    }
  }

  const discardChanges = async () => {
    await setCurrentThemeAsync(savedTheme)
    setTheme(savedTheme as ImmerseUITheme)
    dispatch(resetThemeTint())
    setHasUnsavedChanges(false)
    setShowWarningDialog(false)
    history.push(settingsPath)
  }

  return (
    <>
      <NavLink to={useSettingsPath({ settingsSection })} onClick={handleClick}>
        <li>{label}</li>
      </NavLink>
      {showWarningDialog && (
        <SimpleWarningDialog
          open
          hideCloseIcon
          title={"Discard Unsaved Changes"}
          message={
            "This page contains unsaved changes. Are you sure you want to discard your changes?"
          }
          primaryAction={discardChanges}
          primaryLabel={"Yes, Discard Changes"}
          secondaryAction={() => setShowWarningDialog(false)}
          secondaryLabel={"No, Cancel"}
          className="app-overlay"
        />
      )}
    </>
  )
}

export default SettingsNavItem
