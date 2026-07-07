// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useRef, useCallback } from "react"
import { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"
import { Link } from "react-router-dom"
import { Tooltip } from "@rmwc/tooltip"
import { IconButton } from "widgets/icon-button/Icon-button"

import {
  addDashboardTab,
  setDashboardTabOrder
} from "actions/dashboard-action-creators"
import { getFirstTabId } from "sagas/dashboard-sagas"
import { getDatabase } from "selectors"
import { routeToDashboard } from "utils/routerPath"
import { AppState } from "vega/charts/types"
import {
  ImmerseUIRequired,
  IMMERSE_UI_ADD_TAB,
  IMMERSE_UI_TABS
} from "services/immerse-ui-provider"

import Tab from "./Tab"

import "./styles.scss"

const mapStateToProps = (state: AppState) => {
  const dashboardId = state?.dashboard?.id
  const database = getDatabase(state)
  const selectedTabId = state?.dashboard?.selectedTabId
  const tabs = state?.dashboard?.tabs || {}

  const nextTabIndex = tabs[selectedTabId]?.index + 1
  const nextTabId =
    Object.keys(tabs).find((id) => tabs[id]?.index === nextTabIndex) ||
    getFirstTabId(tabs)

  return {
    dashboardId,
    database,
    nextTabId,
    selectedTabId,
    tabs,
    dashboardPrivileges: state.dashboard.privileges
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    actions: {
      addTab() {
        dispatch(addDashboardTab())
      },
      setDashboardTabOrder(orderedTabs) {
        dispatch(setDashboardTabOrder(orderedTabs))
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  null,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector>

const Tabs: FC<Props> = ({
  dashboardId,
  database,
  nextTabId,
  selectedTabId,
  tabs,
  actions,
  restrictViewing
}) => {
  // Keep track of scroll position just to update tab menu position
  const scrollContainerRef = useRef(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  const onScrollTabContainer = () =>
    setScrollPosition(scrollContainerRef.current?.scrollLeft)

  const onMoveTab = useCallback(
    (dragIndex, hoverIndex) => {
      const newOrder = Object.keys(tabs).sort((a, b) => {
        return tabs[a].index - tabs[b].index
      })

      const draggedTab = newOrder.splice(dragIndex, 1)
      newOrder.splice(hoverIndex, 0, draggedTab)

      actions.setDashboardTabOrder(newOrder)
    },
    [actions, tabs]
  )

  return (
    <ImmerseUIRequired uiKey={IMMERSE_UI_TABS}>
      <div className="dashboard-tab-panel" data-testid="tab-panel">
        <div id="dashboard-tab-menu-portal-root" />
        <Tooltip content="Next tab" enterDelay={500}>
          <div className="dashboard-tab-next">
            <Link
              to={routeToDashboard(database, dashboardId, nextTabId)}
              replace
            >
              <IconButton
                className="dashboard-tab-next-icon"
                icon="skip_next"
              />
            </Link>
          </div>
        </Tooltip>
        <div
          className="dashboard-tab-scroll-container"
          onScroll={onScrollTabContainer}
          ref={scrollContainerRef}
        >
          {tabs ? (
            Object.keys(tabs)
              .sort((a, b) => {
                return tabs[a].index - tabs[b].index
              })
              .map((tabId, index) => (
                <Tab
                  key={tabId}
                  {...{
                    active: selectedTabId === tabId,
                    tabId,
                    dashboardId,
                    index,
                    containerScrollPosition: scrollPosition,
                    onMoveTab,
                    restrictViewing
                  }}
                />
              ))
          ) : (
            <span>No tabs</span>
          )}
        </div>
        {!restrictViewing && (
          <ImmerseUIRequired uiKey={IMMERSE_UI_ADD_TAB}>
            <Tooltip content="Add a tab" enterDelay={500}>
              <div className="dashboard-tab-add">
                <IconButton
                  className="dashboard-tab-add-icon"
                  icon="add"
                  onClick={actions.addTab}
                />
              </div>
            </Tooltip>
          </ImmerseUIRequired>
        )}
      </div>
    </ImmerseUIRequired>
  )
}

export default connector(Tabs)
