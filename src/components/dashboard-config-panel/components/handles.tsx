// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import cx from "classnames"

import { Tooltip } from "@rmwc/tooltip"

import FilterIcon from "components/svg-icons/icon-filter"
import PaletteIcon from "components/svg-icons/icon-palette"
import ParameterPanelIcon from "components/svg-icons/icon-parameter-panel"
import CrossLinkIcon from "components/svg-icons/icon-crosslink"
import {
  available_feature_flags,
  getFeatureFlag
} from "components/control-panel/featureflags"
import { useImmerseUIContext } from "services/immerse-ui-provider/ImmerseUIContext"

import { PanelTypes } from "../types"

interface Props {
  open: boolean
  onClickHandle: (clickedPanelName: PanelTypes) => void
  currentPanel: PanelTypes
  showUiConfigHandle: boolean
}

const Handles: FC<Props> = ({
  open,
  onClickHandle,
  currentPanel,
  showUiConfigHandle
}) => {
  const containerClasses = cx("dashboard-config-handle-container", { open })

  const {
    immerseUIKeys: {
      IMMERSE_UI_SIDE_PANELS,
      IMMERSE_UI_FILTERS,
      IMMERSE_UI_PARAMETERS,
      IMMERSE_UI_CONFIG_UI,
      IMMERSE_UI_CROSSLINK
    }
  } = useImmerseUIContext()

  const handleTypes = [
    IMMERSE_UI_SIDE_PANELS &&
      IMMERSE_UI_FILTERS && {
        type: PanelTypes.FILTER,
        icon: <FilterIcon />,
        tooltip: "Filters"
      },
    IMMERSE_UI_SIDE_PANELS &&
      IMMERSE_UI_PARAMETERS && {
        type: PanelTypes.PARAMETER,
        hideHandle: !getFeatureFlag(available_feature_flags.ENABLE_PARAMETERS),
        icon: <ParameterPanelIcon />,
        tooltip: "Parameters"
      },
    IMMERSE_UI_SIDE_PANELS &&
      IMMERSE_UI_CROSSLINK && {
        type: PanelTypes.CROSSLINK,
        hideHandle: !getFeatureFlag(
          available_feature_flags.ENABLE_CROSSLINK_PANEL
        ),
        icon: <CrossLinkIcon />,
        tooltip: "Cross-linking"
      },
    IMMERSE_UI_SIDE_PANELS &&
      IMMERSE_UI_CONFIG_UI && {
        type: PanelTypes.UI,
        hideHandle: !showUiConfigHandle,
        testId: "ui-config-panel-handle",
        icon: <PaletteIcon />,
        tooltip: "UI Settings"
      }
  ].filter((h) => Boolean(h))

  return (
    <div className={containerClasses}>
      {handleTypes.map(
        ({ type, hideHandle, tooltip, icon, testId }) =>
          !hideHandle && (
            <Tooltip
              key={`${type}-panel-handle`}
              content={tooltip}
              enterDelay={500}
            >
              <div
                onClick={() => onClickHandle(type)}
                data-testid={testId || `${type.toLowerCase()}-panel-handle`}
                className={cx("handle", {
                  selected: open && currentPanel === type
                })}
              >
                {icon}
              </div>
            </Tooltip>
          )
      )}
    </div>
  )
}

export default Handles
