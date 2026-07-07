// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import { SimpleSelect } from "react-selectize"
import PropTypes from "prop-types"

import { isGeo } from "constants/data-types"
import ChartSourceSelector from "vega/components/SourceSelector/ChartSourceSelector"

// eslint-disable-next-line react/prefer-stateless-function
export default class ChartSettingsGeoJsonDropdown extends Component {
  static propTypes = {
    chartType: PropTypes.string.isRequired,
    defaultValue: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    }),
    geoJoin: PropTypes.shape({
      table: PropTypes.string
    }),
    isPolyRasterEnabled: PropTypes.bool.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    ),
    selectJoinDataSource: PropTypes.func,
    updateGeoJoinValue: PropTypes.func.isRequired,
    updateGeoJsonValue: PropTypes.func.isRequired,
    dataSourceFilterFunc: PropTypes.func,
    clearJoinDataSource: PropTypes.func,
    isDisabled: PropTypes.bool,
    disabledTooltip: PropTypes.string
  }

  static defaultProps = {
    dataSourceFilterFunc: null
  }

  render() {
    const {
      defaultValue,
      updateGeoJsonValue,
      updateGeoJoinValue,
      options = [],
      isPolyRasterEnabled,
      geoJoin,
      chartType,
      selectJoinDataSource,
      dataSourceFilterFunc,
      clearJoinDataSource,
      isDisabled,
      disabledTooltip
    } = this.props

    if (
      isPolyRasterEnabled &&
      (chartType === "backendChoropleth" || chartType === "linemap")
    ) {
      const valid_cols = options.filter((option) => !isGeo(option.type))
      return (
        <div className="geo-join-source-selector">
          <ChartSourceSelector
            selectedTable={geoJoin.table}
            onChange={selectJoinDataSource}
            tableMetaFilter={dataSourceFilterFunc}
            onClear={clearJoinDataSource}
            disabled={isDisabled}
            disabledTooltip={disabledTooltip}
          />
          {geoJoin.table && !isDisabled && (
            <div className="geo-json-dropdown">
              <SimpleSelect
                defaultValue={defaultValue}
                onValueChange={updateGeoJoinValue}
                options={valid_cols}
                placeholder="Select a Column to Join"
                value={defaultValue}
              />
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div className="geo-json-dropdown">
          <SimpleSelect
            defaultValue={defaultValue}
            onValueChange={updateGeoJsonValue}
            options={options}
            placeholder="Select a Geo JSON"
          />
        </div>
      )
    }
  }
}
