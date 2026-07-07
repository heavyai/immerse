// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import moment from "moment"
import { Link } from "react-router-dom"
import { routeToDashboard } from "utils/routerPath"
import { Checkbox } from "@rmwc/checkbox"

import DashboardMenu from "components/dashboard-row-item/dashboard-menu"
import SearchTermHighlight from "components/search-term-highlight/search-term-highlight"
import IconSharedWithMe from "components/svg-icons/icon-shared-with-me"
import IconSharedWithOthers from "components/svg-icons/icon-shared-with-others"
import { hasParamSyntax } from "utils/parameters"

DashboardRowItem.propTypes = {
  deleteClick: PropTypes.func,
  copyDashboard: PropTypes.func,
  exportDashboard: PropTypes.func,
  showDeleteDashboardModal: PropTypes.func,
  id: PropTypes.number,
  isPendingDelete: PropTypes.bool,
  searchVal: PropTypes.string,
  tableName: PropTypes.string,
  username: PropTypes.string,
  update_time: PropTypes.string,
  dashboard_name: PropTypes.string,
  dashboard_owner: PropTypes.string,
  is_dash_shared: PropTypes.bool,
  database: PropTypes.string,
  style: PropTypes.object,
  selected: PropTypes.bool,
  toggle: PropTypes.func.isRequired,
  sharingEnabled: PropTypes.bool
}

const handleMouseEnter = (setMenuVisible) => () => {
  setMenuVisible(true)
}

const handleMouseLeave = (setMenuVisible) => () => {
  setMenuVisible(false)
}

const preventDefault = (evt) => {
  evt.preventDefault()
  evt.stopPropagation()
}

const formatDataSources = (dataSources) => {
  return dataSources
    .map((table) => {
      if (hasParamSyntax(table)) {
        return "Custom Source"
      } else {
        return table
      }
    })
    .join(" . ")
}

export default function DashboardRowItem({
  copyDashboard,
  exportDashboard,
  showDeleteDashboardModal,
  sharingEnabled,
  id,
  isPendingDelete,
  searchVal,
  tableName,
  username,
  update_time,
  dashboard_name,
  dashboard_name_formatted,
  dashboard_owner,
  is_dash_shared,
  dashboard_id,
  database,
  style,
  selected,
  toggle,
  version
}) {
  const [menuVisible, setMenuVisible] = useState(false)
  const uniqueTableNames = tableName ? [...new Set(tableName.split(", "))] : []
  const formattedTableNames = formatDataSources(uniqueTableNames)

  const maybeRenderShareIcon = () => {
    if (is_dash_shared) {
      if (dashboard_owner === username) {
        return <IconSharedWithOthers />
      } else {
        return <IconSharedWithMe />
      }
    } else {
      return null
    }
  }

  const onToggle = () => {
    toggle(dashboard_id)
  }

  return (
    <Link
      style={style}
      className={cx("row-item", { deleteAnimation: isPendingDelete })}
      to={routeToDashboard(database, dashboard_id)}
      onMouseEnter={handleMouseEnter(setMenuVisible)}
      onMouseLeave={handleMouseLeave(setMenuVisible)}
    >
      <div className="cell dashboards-checkbox">
        <Checkbox
          checked={selected}
          onClick={preventDefault}
          onChange={onToggle}
        />
      </div>
      <div className="cell dashboard-name" title={dashboard_name}>
        <SearchTermHighlight
          id={`dashboard-name-${id}`}
          name={
            dashboard_name_formatted ? dashboard_name_formatted : dashboard_name
          }
          term={searchVal}
        />
      </div>
      <div className="cell-group">
        <div
          id={`dashboard-sources-${id}`}
          className={cx("cell", "dashboard-sources", { empty: !tableName })}
        >
          {tableName ? (
            <SearchTermHighlight name={formattedTableNames} term={searchVal} />
          ) : (
            <span>No sources yet</span>
          )}
        </div>
        <div
          className="cell dashboard-update-time"
          id={`dashboard-modified-${id}`}
        >
          <span>
            {moment(update_time).locale("en").format("MMM D, YYYY [·] h:mm a")}
          </span>
        </div>
        <div className="cell dashboard-owner" id={`dashboard-owner-${id}`}>
          <span>{dashboard_owner}</span>
        </div>
        {sharingEnabled && (
          <div className="cell" id={`dashboard-shared-${id}`}>
            <div className="dashboard-shared-icon">
              {maybeRenderShareIcon()}
            </div>
          </div>
        )}
        {version && (
          <div className="cell">
            <span>{version}</span>
          </div>
        )}
      </div>
      <DashboardMenu
        dashboardId={id}
        dashboardName={dashboard_name}
        visible={menuVisible}
        copyDashboard={copyDashboard}
        exportDashboard={exportDashboard}
        deleteDashboard={showDeleteDashboardModal}
      />
    </Link>
  )
}
