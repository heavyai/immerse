// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import cx from "classnames"
import { PaletteMapping } from "../types"
import { Link } from "@material-ui/core"
import { Tooltip } from "@rmwc/tooltip"
import { WarningGradientIcon } from "components/svg-icons/icon-warning-gradient"
import { PaletteMappingSelectorItem } from "./palette-mapping-selector-item"

import { IconButton } from "@rmwc/icon-button"
import { IconSaveOutline } from "components/svg-icons/icon-save-outline"
import { IconTrashOutline } from "components/svg-icons/icon-trash-outline"
import "./palette-mapping-item-menu.scss"
import { TooltipIfContent } from "components/tooltip-if-content/tooltip-if-content"

export const PaletteMappingItemMenu = ({
  paletteMapping,
  onClear,
  onSave,
  onDelete,
  onReset,
  isDirty = false
}: {
  paletteMapping: PaletteMapping
  onClear: () => void
  onSave: () => void
  onDelete: () => void
  onReset: () => void
  isDirty: boolean
}) => {
  return (
    <div className="palette-mapping-item-menu">
      <div className="palette-mapping-item-menu__row">
        {isDirty ? (
          <div className="palette-mapping-item-menu__reset">
            <Tooltip
              content="This mapping has unsaved changes"
              className="rmwc-tooltip--warning"
            >
              <div>
                <WarningGradientIcon />
              </div>
            </Tooltip>
            <Link component="button" onClick={onReset}>
              Reset
            </Link>
          </div>
        ) : (
          <div />
        )}
      </div>

      <div className="palette-mapping-item-menu__row">
        <div
          className={cx("mapping-container", {
            "mapping-container--dirty": isDirty
          })}
        >
          <PaletteMappingSelectorItem mapping={paletteMapping} editable />
        </div>
        <div className="palette-mapping-item-menu__actions">
          <TooltipIfContent content={!isDirty ? "No unsaved changes" : null}>
            <div>
              <IconButton
                icon={<IconSaveOutline />}
                onClick={onSave}
                disabled={!isDirty}
                ripple={false}
                data-testid="palette-mapping-actions__save"
              />
            </div>
          </TooltipIfContent>
          <IconButton
            icon={<IconTrashOutline />}
            onClick={onDelete}
            ripple={false}
            data-testid="palette-mapping-actions__delete"
          />
        </div>
      </div>
      <div className="palette-mapping-item-menu__row">
        <Link component="button" onClick={onClear}>
          Remove Mapping
        </Link>
      </div>
    </div>
  )
}
