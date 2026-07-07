// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import CountWidget from "components/count-widget/count-widget"
import cx from "classnames"
import Icon from "components/icon/icon"
import IconDataSource from "components/icon-data-source/icon-data-source"
import { onEditPath } from "utils/routerPath"
import { setCurrentDataSource } from "actions/dashboard-action-creators"
import { getActiveDataSources } from "utils/currently-active-datasources"
import Services from "services/immerse"
import { findJoinDataSourceForParameter } from "components/join-manager/use-join-from-parameter"

const ANIMATION_DURATION = 200

export function mapStateToProps(state, ownProps) {
  const { chartEditor, charts, dashboard, dc, joinDataSources } = state
  const { location = { pathname: "" } } = ownProps
  const route = location.pathname
  const dataSourcesCurrentlyInFiltersOrCharts = getActiveDataSources(
    state,
    true
  )
  const currentDataSource =
    dashboard.currentDataSource || dataSourcesCurrentlyInFiltersOrCharts[0]

  return {
    allChartsInitialized: dc.initialRender.done,
    inEditor: onEditPath(route),
    shouldShowSourceIcon: Object.keys(dashboard.dataSources).length > 1,
    chartEditSource:
      onEditPath(route) && charts[chartEditor.editId]
        ? charts[chartEditor.editId].dataSource
        : false,
    dataSources: dashboard.dataSources,
    dataSourcesCurrentlyInFiltersOrCharts,
    currentDataSource,
    dashboardId: dashboard.id,
    tabId: dashboard.selectedTabId,
    joinDataSources
  }
}

export class MultiCount extends React.Component {
  static propTypes = {
    allChartsInitialized: PropTypes.bool.isRequired,
    chartEditSource: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    currentDataSource: PropTypes.string,
    dataSources: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    inEditor: PropTypes.bool.isRequired,
    MapD: PropTypes.object,
    shouldShowSourceIcon: PropTypes.bool.isRequired,
    dataSourcesCurrentlyInFiltersOrCharts: PropTypes.arrayOf(PropTypes.string),
    joinDataSources: PropTypes.arrayOf(PropTypes.object)
  }

  state = {
    source: this.props.currentDataSource,
    showCountDropDown: false
  }

  UNSAFE_componentWillReceiveProps({
    currentDataSource,
    inEditor,
    chartEditSource
  }) {
    if (currentDataSource !== this.props.currentDataSource) {
      setTimeout(() => {
        this.setState({ source: currentDataSource })
      }, ANIMATION_DURATION)
    }
    if (inEditor && !this.props.inEditor && currentDataSource) {
      this.props.dispatch(setCurrentDataSource(chartEditSource))
    }
  }

  toggleCountDropDown = () => {
    this.setState({ showCountDropDown: !this.state.showCountDropDown })
  }

  selectDataSource = (source) => {
    this.props.dispatch(setCurrentDataSource(source))
    this.setState({ showCountDropDown: false })
  }

  render() {
    const { joinDataSources } = this.props
    if (this.props.dataSourcesCurrentlyInFiltersOrCharts.length === 0) {
      return <></>
    } else {
      const showSource = !this.state.showCountDropDown

      const currentSourceDisplayName =
        findJoinDataSourceForParameter(this.state.source, joinDataSources)
          ?.name ?? this.state.source
      return (
        <div className="count-widget-container">
          {this.state.showCountDropDown && (
            <div className="count-list-container">
              <div className="count-list">
                {this.props.dataSourcesCurrentlyInFiltersOrCharts.map(
                  (source) => {
                    const sourceDisplayName =
                      findJoinDataSourceForParameter(source, joinDataSources)
                        ?.name ?? source
                    return (
                      this.props.dataSources[source] && (
                        <div
                          className="count-row-item"
                          key={`${source}itemkey`}
                          onClick={() => {
                            this.selectDataSource(source)
                            this.toggleCountDropDown()
                          }}
                        >
                          <div className="data-source">
                            <IconDataSource
                              alias={this.props.dataSources[source].alias}
                            />
                            <div
                              className="data-source-name"
                              title={sourceDisplayName}
                            >
                              {sourceDisplayName}
                            </div>
                          </div>
                          <CountWidget
                            allChartsInitialized={
                              this.props.allChartsInitialized
                            }
                            crossfilter={Services.get(
                              "crossfilter"
                            ).getCrossfilter(source)}
                            dispatch={this.props.dispatch}
                            id={source}
                            key={source}
                            dashboardId={this.props.dashboardId}
                            tabId={this.props.tabId}
                          />
                        </div>
                      )
                    )
                  }
                )}
              </div>

              {
                <div
                  className="count-dropdown-closer"
                  onClick={this.toggleCountDropDown}
                >
                  <Icon name="tick" viewBox="8 10 36 36" />
                </div>
              }
            </div>
          )}
          {showSource && (
            <>
              {((this.props.inEditor && this.props.chartEditSource) ||
                !this.props.inEditor) && (
                <div
                  className={cx("animated-count", {
                    fadeOutDown:
                      this.state.source !== this.props.currentDataSource
                  })}
                >
                  <div className="data-source">
                    {this.props.shouldShowSourceIcon &&
                      this.props.dataSources[this.state.source] && (
                        <IconDataSource
                          alias={
                            this.props.dataSources[this.state.source].alias
                          }
                          viewBox="7 3 48 48"
                        />
                      )}
                    <div className="data-source-name">
                      {currentSourceDisplayName}
                      <span className="middot-spacer">{"·"}</span>
                    </div>
                  </div>
                  <CountWidget
                    allChartsInitialized={this.props.allChartsInitialized}
                    crossfilter={Services.get("crossfilter").getCrossfilter(
                      this.state.source
                    )}
                    dispatch={this.props.dispatch}
                    id={this.state.source}
                    key={this.state.source}
                    dashboardId={this.props.dashboardId}
                    tabId={this.props.tabId}
                  />
                </div>
              )}
              {!this.props.inEditor &&
                this.props.dataSourcesCurrentlyInFiltersOrCharts.length > 1 &&
                Object.keys(this.props.dataSources).length > 1 && (
                  <div
                    className="count-dropdown-opener"
                    onClick={this.toggleCountDropDown}
                  >
                    <Icon name="tick" viewBox="8 10 36 36" />
                  </div>
                )}
            </>
          )}
        </div>
      )
    }
  }
}

export default connect(mapStateToProps)(MultiCount)
