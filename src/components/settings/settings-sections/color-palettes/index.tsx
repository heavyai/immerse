// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useContext, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { isEqual } from "lodash"
import cx from "classnames"

import ColorPalette from "components/ui-config-panel/ColorPaletteSection/ColorPalette"
import QuantitativeColorPalette from "components/ui-config-panel/ColorPaletteSection/QuantitativeColorPalette"
import OrdinalColorPalette from "components/ui-config-panel/ColorPaletteSection/OrdinalColorPalette"
import { SecondaryButton } from "widgets/button/Button"
import IconSave from "components/svg-icons/icon-save"

import { SettingsContext } from "../../settings-context"
import { getUserConfigurableUISettings } from "reducers/user-configurable-ui-reducer"
import { setServersJSONColors } from "actions/user-configurable-ui-action-creators"
import { showUnsavedChangesDialog } from "actions/nav-bar-action-creators"
import { setAndCacheConfigurationInstance } from "actions/refresh-action-creators"
import { getConfigurationInstance } from "services/configuration-instance"
import { COLOR_PALETTE_DESCRIPTIONS } from "constants/text"
import { OmniColorSchemes } from "services/colors"
import {
  SimpleColorPalette,
  NestedColorPalette
} from "components/ui-config-panel/types"
import { CautionIcon } from "components/svg-icons/icon-caution"
import { SettingsErrorSnackbar } from "../../error-snackbar"
import { SAVE_CHANGES_ERROR } from "../../error-snackbar/error-text"

import "./styles.scss"

export const ColorPalettes = () => {
  const [colorPalettes, setColorPalettes] = useState<OmniColorSchemes>(
    getUserConfigurableUISettings(useSelector((state) => state))?.colorPalettes
  )
  const initialColorPalettesRef = useRef(colorPalettes)
  const initialColorPalettes = initialColorPalettesRef.current
  const [error, setError] = useState("")
  const { hasUnsavedChanges, setHasUnsavedChanges } = useContext(
    SettingsContext
  )
  const dispatch = useDispatch()

  const handlePaletteChange = (
    palette: SimpleColorPalette | NestedColorPalette,
    type: string
  ): void => {
    const updatedColorPalettes = {
      ...colorPalettes,
      [type]: palette
    }
    if (!isEqual(initialColorPalettes, updatedColorPalettes)) {
      setHasUnsavedChanges(true)
      dispatch(showUnsavedChangesDialog(true))
    } else {
      setHasUnsavedChanges(false)
      dispatch(showUnsavedChangesDialog(false))
    }
    setColorPalettes(updatedColorPalettes)
  }

  const saveColorPalettes = async () => {
    try {
      const resp = await getConfigurationInstance()
      if (!resp.ok) {
        setError(SAVE_CHANGES_ERROR)
        return
      }
      const currentConfig = await resp.json()
      const saveChangesRes = await setAndCacheConfigurationInstance({
        ...currentConfig,
        colors: colorPalettes
      })

      if (!saveChangesRes.ok) {
        setError(SAVE_CHANGES_ERROR)
        return
      }
    } catch (e) {
      setError(SAVE_CHANGES_ERROR)
      return
    }

    dispatch(setServersJSONColors(colorPalettes))
    initialColorPalettesRef.current = colorPalettes
    setHasUnsavedChanges(false)
    dispatch(showUnsavedChangesDialog(false))
  }

  const colorPalettePickers = [
    {
      title: "Solid",
      description:
        "Solid colors, requires 8 or more colors. All measures are assigned one color. The array of colors you provide defines which colors are available.",
      component: (
        <ColorPalette
          label="Solid Colors"
          colorPalette={colorPalettes?.solid}
          setColorPalette={(newPalette) =>
            handlePaletteChange(newPalette, "solid")
          }
        />
      )
    },
    {
      title: "Categorical",
      description:
        "4 scales, 1 or more colors each scale. Defines a range of colors that measures iterate through repeatedly. The size of the range can vary.",
      component: (
        <OrdinalColorPalette
          label="Categorical Colors"
          colorPalettes={colorPalettes?.ordinal}
          setColorPalettes={(newPalette) =>
            handlePaletteChange(newPalette, "ordinal")
          }
        />
      )
    },
    {
      title: "Quantitative",
      description:
        '4 scales, 1 or more colors each scale. Quantitative measures produce smooth, continuous gradients between each "stopping point" defined in the list of colors, in order.',
      component: (
        <QuantitativeColorPalette
          label="Continuous Colors"
          colorPalettes={colorPalettes?.quantitative}
          setColorPalettes={(newPalette) =>
            handlePaletteChange(newPalette, "quantitative")
          }
        />
      )
    }
  ]

  return (
    <div className="settings__content__main color-palettes">
      <SettingsErrorSnackbar
        message={
          <div>
            <strong>Palettes Update Failed:</strong> {error}
          </div>
        }
        dismissIcon="close"
        open={Boolean(error)}
        icon={<CautionIcon />}
        onClose={() => setError("")}
      />
      <header className="settings__content__header">
        <div className="settings__content__header__text">
          <h1>Color Palettes</h1>
          <p>{COLOR_PALETTE_DESCRIPTIONS.heading}</p>
        </div>
        <div className="settings__content__header__controls">
          <SecondaryButton
            className={cx("save-button", {
              success: !hasUnsavedChanges
            })}
            data-testid="save-color-palettes-button"
            icon={<IconSave className="button-icon" />}
            onClick={saveColorPalettes}
          >
            {hasUnsavedChanges ? "Save *" : "Saved"}
          </SecondaryButton>
        </div>
      </header>
      <div className="color-palettes__list">
        {colorPalettePickers.map((picker, index) => (
          <div key={index} className="color-palettes__list__item">
            <div className="color-palettes__list__item__info">
              <p className="color-palettes__list__item__label">
                {picker.title}
              </p>
              <p className="color-palettes__list__item__description">
                {picker.description}
              </p>
            </div>
            <div
              className={`color-palettes__list__item__color-picker ${picker.title.toLowerCase()}-color-picker`}
            >
              {picker.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
