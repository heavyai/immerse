// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import cx from "classnames"
import { OmniColorSchemes } from "services/colors"
import { CustomColorsComboPopup } from "components/custom-colors/custom-colors-combo-popup"
import { MenuSurface, MenuSurfaceAnchor } from "@rmwc/menu"

type Props = {
  /** CSS color for this item */
  color: string

  /** True when item is toggled 'on', false when 'off' */
  visible?: boolean

  /** If true, the item can be locked */
  canLock?: boolean

  /** If true, the item is locked */
  locked?: boolean

  /** The title, or "key", of the item */
  title: string

  /** The value of the item */
  value?: number

  /** Called when the user wants to toggle the item */
  onToggle: (key: string) => void

  /** Called when the user wants to lock the item */
  onLock?: (key: string, color: string, disabled?: boolean) => void

  /** Called when a user wants to unlock the item */
  onUnlock?: (key: string) => void

  /** Called when a user wants to change the item color */
  onChangeColor?: (key: string, color: string, isAllOther?: boolean) => void

  /** helps to identify the actual All Others */
  isAllOther?: boolean

  colorPalette: OmniColorSchemes["custom"]

  customRange?: string[]

  /* Disable actions on this color item, and use the default disabled color */
  disabled?: boolean

  // Enables color swatch customization
  editable?: boolean
}

const TopNItem: FC<Props> = ({
  color,
  visible,
  locked,
  title,
  onToggle,
  customRange = null,
  onLock = () => {},
  onUnlock = () => {},
  onChangeColor = () => {},
  isAllOther,
  colorPalette = [],
  disabled = false,
  canLock = false,
  editable = true
}) => {
  const [colorPopupOpen, setColorPopupOpen] = useState(Boolean(false))

  const closeSwatchPopup = () => {
    setColorPopupOpen(false)
  }

  const toggleColorPopup = () => {
    if (!disabled) {
      setColorPopupOpen(!colorPopupOpen)
    }
  }

  const selectColor = (newColor: string) => {
    onChangeColor(title, newColor, isAllOther)
  }

  const containerClass = cx("top-n-item-container", locked && "locked")
  const colorClass = cx({ disabled, visible }, "top-n-color")

  const italic = title === null || title === undefined

  const additionalColors = [
    ...new Set(customRange?.filter((r) => !colorPalette?.includes(r)))
  ].sort()

  return (
    <div className={containerClass}>
      <div className="top-n-item" data-ui-config-id="legend-discrete">
        {editable ? (
          <MenuSurfaceAnchor>
            <MenuSurface
              hoistToBody
              open={colorPopupOpen}
              onClose={closeSwatchPopup}
            >
              {colorPopupOpen && (
                <CustomColorsComboPopup
                  additionalColors={additionalColors}
                  chooseColor={(colorObj) => selectColor(colorObj.val[0])}
                  selectedColor={color}
                  palette={{
                    val: colorPalette,
                    type: "ordinal"
                  }}
                />
              )}
            </MenuSurface>
            <div
              className={colorClass}
              style={{ backgroundColor: color }}
              onClick={toggleColorPopup}
            />
          </MenuSurfaceAnchor>
        ) : (
          <div
            className={cx({ visible }, "top-n-color", "disabled")}
            style={{ backgroundColor: color }}
          />
        )}
        <div className={cx({ visible, italic }, "top-n-value")}>
          <Tooltip content={String(title)} enterDelay={500}>
            <span>{String(title)}</span>
          </Tooltip>
        </div>
        <div className="top-n-visible">
          <Icon
            icon={!visible ? "visibility_off" : "visibility"}
            onClick={() => onToggle(title)}
          />
        </div>
        {canLock && (
          <div className={cx("top-n-lock", { locked })}>
            <Icon
              className={locked ? "locked" : "open"}
              icon={locked ? "lock" : "lock_open"}
              onClick={() =>
                locked ? onUnlock(title) : onLock(title, color, visible)
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
export default TopNItem
