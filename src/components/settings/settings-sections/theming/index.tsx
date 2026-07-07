// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback
} from "react"
import { useSelector, useDispatch } from "react-redux"
import { isEqual } from "lodash"
import cx from "classnames"

import { SettingsContext } from "../../settings-context"
import { CustomStylesField, FieldType } from "./custom-styles-field"
import { JSONBrandingElements } from "./json-branding-elements"
import { THEMING_DESCRIPTIONS, DEFAULT_PAGE_TITLE } from "constants/text"
import { CustomStyles, customStyleSelector } from "reducers/connection"
import {
  setThemeTint,
  setSavedThemeTint,
  setCurrentUITheme,
  setSavedUITheme,
  setCustomThemeEnabled
} from "actions/user-configurable-ui-action-creators"
import { showUnsavedChangesDialog } from "actions/nav-bar-action-creators"
import { setUserData } from "actions/connection-action-creators"
import { SecondaryButton } from "widgets/button/Button"
import IconSave from "components/svg-icons/icon-save"
import { setAndCacheConfigurationInstance } from "actions/refresh-action-creators"
import { getConfigurationInstance } from "services/configuration-instance"
import { setCustomTitle } from "utils/page-and-meta-helpers"
import { currentTheme, setCurrentThemeAsync } from "utils/dark-mode-switcher"
import { CautionIcon } from "components/svg-icons/icon-caution"
import { ThemeSelectionInput } from "./theme-selection-input"
import { EnableCustomTheme } from "./enable-custom-theme"
import { CustomThemeColorPicker } from "./custom-theme-color-picker"
import { SettingsErrorSnackbar } from "../../error-snackbar"
import { SAVE_CHANGES_ERROR } from "../../error-snackbar/error-text"
import { DARK_THEME, LIGHT_THEME, CUSTOM_THEME } from "utils/theme/types"

import "./styles.scss"

type JSONBrandingElement = {
  key: string
  name: string
  description: string
  type: FieldType
  value: string
  singleLine?: boolean
}

export const ImmerseTheming = () => {
  const { hasUnsavedChanges, setHasUnsavedChanges } = useContext(
    SettingsContext
  )

  const [error, setError] = useState("")

  const [customStyles, setCustomStyles] = useState<CustomStyles>(
    customStyleSelector(useSelector((state) => state))
  )
  const initialCustomStylesRef = useRef(customStyles)
  const initialCustomStyles = initialCustomStylesRef.current

  const [tintColor, setTintColor] = useState(
    useSelector(({ userConfigurableUI: { themeTint } }) => themeTint)
  )
  const initialTintColor = useRef(tintColor).current

  const [showCustomTheme, setShowCustomTheme] = useState(
    useSelector(
      ({ userConfigurableUI: { customThemeEnabled } }) => customThemeEnabled
    )
  )
  const initialShowCustomTheme = useRef(showCustomTheme).current
  const [uiTheme, setUITheme] = useState(currentTheme())
  const initialUITheme = useRef(uiTheme).current
  const [availableThemes, setAvailableThemes] = useState(
    showCustomTheme
      ? [DARK_THEME, LIGHT_THEME, CUSTOM_THEME]
      : [DARK_THEME, LIGHT_THEME]
  )

  const dispatch = useDispatch()

  const handleUnsavedChanges = useCallback(
    (hasChanges: boolean) => {
      setHasUnsavedChanges(hasChanges)
      dispatch(showUnsavedChangesDialog(hasChanges))
    },
    [dispatch, setHasUnsavedChanges]
  )

  const handleShowCustomThemeChange = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (!enabled) {
        await setCurrentThemeAsync(DARK_THEME)
        setUITheme(DARK_THEME)
      }
      const hasChanges = enabled !== initialShowCustomTheme
      handleUnsavedChanges(hasChanges)
      setShowCustomTheme(enabled)
    },
    [initialShowCustomTheme, handleUnsavedChanges]
  )

  const handleColorChange = useCallback(
    (color: any): void => {
      const hasChanges = color.hex !== initialTintColor
      handleUnsavedChanges(hasChanges)
      setTintColor(color)
      dispatch(setThemeTint(color))
    },
    [dispatch, initialTintColor, handleUnsavedChanges]
  )

  const updateCustomStyles = useCallback(
    (field: string, value: string | boolean): void => {
      const newCustomStyles = { ...customStyles, [field]: value }
      const hasChanges = !isEqual(newCustomStyles, initialCustomStyles)
      handleUnsavedChanges(hasChanges)
      setCustomStyles(newCustomStyles)
    },
    [customStyles, initialCustomStyles, handleUnsavedChanges]
  )

  const handleUIThemeChange = useCallback(
    async (theme: string): Promise<void> => {
      await setCurrentThemeAsync(theme, showCustomTheme)
      dispatch(setCurrentUITheme(theme))
      const hasChanges = theme !== initialUITheme
      handleUnsavedChanges(hasChanges)
      setUITheme(theme)
    },
    [dispatch, showCustomTheme, initialUITheme, handleUnsavedChanges]
  )

  const saveThemingChanges = async () => {
    try {
      const resp = await getConfigurationInstance()
      if (!resp.ok) {
        setError(SAVE_CHANGES_ERROR)
        return
      }

      const currentConfig = await resp.json()
      const setThemeRes = await setAndCacheConfigurationInstance({
        ...currentConfig,
        theming: {
          ...customStyles,
          customThemeEnabled: showCustomTheme,
          defaultTheme: uiTheme,
          themeTint: tintColor
        }
      })

      if (!setThemeRes.ok) {
        setError(SAVE_CHANGES_ERROR)
        return
      }
    } catch (e) {
      setError(SAVE_CHANGES_ERROR)
      return
    }

    // update page title
    setCustomTitle(customStyles?.title || DEFAULT_PAGE_TITLE)
    // updates rest of customStyles in redux
    dispatch(setUserData({ customStyles }))
    // save theming settings in db
    // whether custom theme is enabled or not
    dispatch(setCustomThemeEnabled(showCustomTheme))
    // update cached tint color to current
    dispatch(setSavedThemeTint(tintColor))
    // update cached theme to current
    dispatch(setSavedUITheme(uiTheme))

    initialCustomStylesRef.current = customStyles
    setHasUnsavedChanges(false)
    dispatch(showUnsavedChangesDialog(false))
  }

  useEffect(() => {
    dispatch(setSavedThemeTint(initialTintColor))
  }, [dispatch, initialTintColor])

  useEffect(() => {
    dispatch(setSavedUITheme(initialUITheme))
  }, [dispatch, initialUITheme])

  useEffect(() => {
    setAvailableThemes(
      showCustomTheme
        ? [DARK_THEME, LIGHT_THEME, CUSTOM_THEME]
        : [DARK_THEME, LIGHT_THEME]
    )
  }, [showCustomTheme])

  return (
    <div className="settings__content__main theming-settings">
      <SettingsErrorSnackbar
        message={
          <div>
            <strong>Theme Update Failed:</strong> {error}
          </div>
        }
        dismissIcon="close"
        open={Boolean(error)}
        icon={<CautionIcon />}
        onClose={() => setError("")}
      />
      <header className="settings__content__header">
        <div className="settings__content__header__text">
          <h1>Immerse Theming</h1>
          <p>{THEMING_DESCRIPTIONS.heading}</p>
        </div>
        <div className="settings__content__header__controls">
          <SecondaryButton
            className={cx("save-button", {
              success: !hasUnsavedChanges
            })}
            id="theming-save"
            data-testid="save-theming-button"
            icon={<IconSave className="button-icon" />}
            onClick={saveThemingChanges}
          >
            {hasUnsavedChanges ? "Save *" : "Saved"}
          </SecondaryButton>
        </div>
      </header>
      <div className="theming-settings__list">
        <EnableCustomTheme
          title="Enable Custom Theme"
          description="Enable the new Custom UI Theme in the theme selection dropdown."
          enabled={showCustomTheme}
          onChange={handleShowCustomThemeChange}
        />
        <ThemeSelectionInput
          title="Default UI Theme"
          description="Default Immerse UI theme for all users."
          uiTheme={uiTheme}
          availableThemes={availableThemes}
          onChange={handleUIThemeChange}
        />
        {showCustomTheme && (
          <CustomThemeColorPicker
            title="Custom Theme Base Color"
            description="Base color used for deriving application colors while using Custom theme."
            color={tintColor.hex}
            onChange={handleColorChange}
          />
        )}

        {JSONBrandingElements.map((elem: JSONBrandingElement) => (
          <CustomStylesField
            key={elem.key}
            prop={elem.key}
            name={elem.name}
            description={elem.description}
            type={elem.type}
            value={customStyles[elem.key] || elem.value}
            singleLine={elem?.singleLine}
            onUpdate={updateCustomStyles}
          />
        ))}
      </div>
    </div>
  )
}
