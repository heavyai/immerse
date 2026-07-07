// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { connect, ConnectedProps, useDispatch, useSelector } from "react-redux"
import cx from "classnames"
import { Resizable } from "react-resizable"

import { AppState } from "vega/charts/types"
import { PanelTypes } from "./types"

import FilterPanel from "components/new-filters/filter-panel/filter-panel"
import UIConfigPanel from "components/ui-config-panel/index"
import ParameterPanel from "components/parameter-panel"
import CrossLinkPanel from "components/crosslink-panel"

import { DEFAULT_DB_CONFIG_USER_ROLE } from "components/ui-config-panel/constants"
import { MIN_DASHBOARD_CONFIG_PANEL_WIDTH } from "components/dashboard/consts"
import { setConfigPanelWidth } from "actions/dashboard-action-creators"

import Handles from "./components/handles"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

const { SHOW_UI_CONFIG_PANEL, KIOSK_MODE } = available_feature_flags

import "./styles.scss"

interface OwnProps {
  // Whether we're currently in chart editor mode
  isInChartEditor: boolean
  // Whether the user is viewing advanced filter controls in the filter panel
  showAdvancedFilterControls: boolean
  // Function to toggle advanced filter controls on and off
  toggleAdvancedFilterControls: (
    showAdvancedFilterControls: boolean | undefined
  ) => void
  // function to toggle panel open and closed
  setOpen: (open: boolean) => void
  // whether panel is currently open
  isOpen: boolean
  width: number
  setWidth: (width: number) => void
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  const showUiConfigHandle =
    getFeatureFlag(SHOW_UI_CONFIG_PANEL) ||
    state.connection?.isSuperuser ||
    state.connection?.roles?.includes(
      state.connection?.user?.uiConfigRole || DEFAULT_DB_CONFIG_USER_ROLE
    )

  return {
    ...ownProps,
    showUiConfigHandle
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  undefined,
  OwnProps,
  AppState
>(mapStateToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const DashboardConfigPanel: FC<Props> = ({
  isInChartEditor,
  showAdvancedFilterControls,
  toggleAdvancedFilterControls,
  showUiConfigHandle,
  setOpen,
  isOpen
}) => {
  const dispatch = useDispatch()
  const [panel, setPanel] = useState<PanelTypes>(PanelTypes.FILTER)

  const width = useSelector(
    (state: AppState) =>
      state.dashboard.configPanelWidth || MIN_DASHBOARD_CONFIG_PANEL_WIDTH
  )

  const onResize = (event, { size }) => {
    dispatch(setConfigPanelWidth(size.width))
  }

  // What happens when a handle is clicked:
  //  - If the panel is closed, OPEN
  //  - If the panel is open:
  //    - If different handle than currently selected, SWITCH PANELS
  //    - If same handle is clicked, CLOSE
  const onClickHandle = (clickedPanelName: PanelTypes) => {
    if (isOpen === false) {
      setPanel(clickedPanelName)
      setOpen(true)
    } else if (panel === clickedPanelName) {
      setOpen(false)
    } else {
      setPanel(clickedPanelName)
    }
  }

  const activePanel = () => {
    switch (panel) {
      case PanelTypes.FILTER:
        return (
          <FilterPanel
            showAdvancedFilterControls={showAdvancedFilterControls}
            toggleAdvancedFilterControls={toggleAdvancedFilterControls}
          />
        )
      case PanelTypes.UI:
        return <UIConfigPanel />
      case PanelTypes.PARAMETER:
        return <ParameterPanel />
      case PanelTypes.CROSSLINK:
        return <CrossLinkPanel />
      default:
        return null
    }
  }

  const showControls = !isInChartEditor && !getFeatureFlag(KIOSK_MODE)
  const configPanel = (
    <div
      className={cx("dashboard-config-container", {
        // Keep component state while in chart editor
        "dashboard-config-container--hidden": isInChartEditor
      })}
    >
      {showControls && (
        <Handles
          open={isOpen}
          onClickHandle={onClickHandle}
          currentPanel={panel}
          showUiConfigHandle={showUiConfigHandle}
        />
      )}
      <div
        className={cx("dashboard-config", {
          "is-open": isOpen
        })}
        style={{
          width: isOpen ? `${width}px` : "0"
        }}
      >
        {showControls && isOpen && activePanel()}
      </div>
    </div>
  )

  return isOpen ? (
    <Resizable
      width={width}
      onResize={onResize}
      resizeHandles={["e"]}
      handle={<div className="resize-handle" />}
      minConstraints={[MIN_DASHBOARD_CONFIG_PANEL_WIDTH]}
    >
      {configPanel}
    </Resizable>
  ) : (
    configPanel
  )
}

export default connector(DashboardConfigPanel)
