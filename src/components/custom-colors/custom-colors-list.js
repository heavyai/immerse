// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import { TextField } from "@rmwc/textfield"
import cx from "classnames"
import { colorShape } from "constants/prop-types"
import { aliasDefaultOtherDomain } from "charts/utils/color-chart"
import CustomColorsListItem, {
  COLUMN_AUTOCOMPLETE_PORTAL_ID
} from "components/custom-colors/custom-colors-list-item"
import Services from "services/immerse"
import {
  isD3ChartWithCustomDomainRange,
  resetD3ChartMappingDomainRange
} from "reducers/charts/helpers/color-helpers"

const customColorsListPropTypes = {
  addColor: PropTypes.func.isRequired,
  addedColor: PropTypes.bool,
  additionalColors: PropTypes.arrayOf(PropTypes.string),
  buttonLabel: PropTypes.string.isRequired,
  chart: PropTypes.any,
  chartId: PropTypes.string,
  columnName: PropTypes.string,
  defaultOtherDomain: PropTypes.string,
  defaultOtherLineStyle: PropTypes.string,
  defaultOtherRange: PropTypes.string,
  disableAdd: PropTypes.bool,
  disableOthers: PropTypes.bool,
  disableRemove: PropTypes.bool,
  disableToggle: PropTypes.bool,
  domain:
    PropTypes.arrayOf(PropTypes.string).isRequired ||
    PropTypes.arrayOf(PropTypes.bool).isRequired,
  getTrueMeasureIndex: PropTypes.func,
  hasAxisSelector: PropTypes.bool.isRequired,
  hasLineStyles: PropTypes.bool.isRequired,
  hasOther: PropTypes.bool.isRequired,
  lineStyles: PropTypes.arrayOf(PropTypes.string),
  markTypes: PropTypes.arrayOf(PropTypes.string),
  multiSourceIndex: PropTypes.string,
  palette: colorShape,
  range: PropTypes.arrayOf(PropTypes.string).isRequired,
  removeColor: PropTypes.func.isRequired,
  setCustomColorValue: PropTypes.func.isRequired,
  setCustomDefaultOtherColorValue: PropTypes.func.isRequired,
  showOther: PropTypes.bool,
  table: PropTypes.string,
  toggleOther: PropTypes.func.isRequired,
  toggleYAxisOrientation: PropTypes.func.isRequired,
  hideOther: PropTypes.bool,
  updateHideOther: PropTypes.func
}

export default class CustomColorsList extends Component {
  static propTypes = customColorsListPropTypes

  state = {
    searchTerm: ""
  }

  getMarkType = (index) => {
    const { markTypes, getTrueMeasureIndex } = this.props
    const measureIndex = getTrueMeasureIndex(String(index))
    const markType =
      markTypes && Array.isArray(markTypes) && markTypes[measureIndex]
        ? markTypes[measureIndex]
        : null
    return markType
  }

  removeColor = (index) => () => {
    // for boolean domain, we don't have Other category which is not removable
    // so we need to leave one of the boolean element in the domain
    if (
      this.props.domain &&
      this.props.domain.length === 1 &&
      typeof this.props.domain[0] === "boolean"
    ) {
      return
    }
    this.props.removeColor(index)
  }

  updateDomainValue = (index) => (value) => {
    this.props.setCustomColorValue(value, index, "customDomain")
  }

  updateDefaultOtherRangeValue = (color) => {
    this.props.setCustomDefaultOtherColorValue(
      color.val[0],
      "defaultOtherRange"
    )
  }

  updateDefaultOtherLineStyle = (style) => {
    this.props.setCustomDefaultOtherColorValue(style, "defaultOtherLineStyle")
  }

  updateRangeValue = (index) => (color) => {
    if (isD3ChartWithCustomDomainRange(this.props.chart)) {
      const dcChart = Services.get("dc").getChart(this.props.chart.dcFlag)
      const range = dcChart.customRange()
      range[index] = color.val[0]
      dcChart.customRange(range)
      resetD3ChartMappingDomainRange(this.props.chart)
    }
    this.props.setCustomColorValue(color.val[0], index, "customRange")
  }

  updateLineStyleValue = (index) => (style) => {
    this.props.setCustomColorValue(style, index, "lineStyles")
  }

  render() {
    const filteredRangeIndices = this.props.range
      // Unfiltered index is needed below, so keep it here
      .map((range, index) => ({ range, index }))
      .filter(({ index }) => {
        // Matches null for null domain value
        const domainValue = this.props.domain[index]
        const stringVal = `${domainValue}`.toLowerCase()
        return stringVal.includes(this.state.searchTerm.toLowerCase())
      })

    return (
      <div className="custom-color-list">
        <div id={COLUMN_AUTOCOMPLETE_PORTAL_ID} />
        <TextField
          value={this.state.searchTerm}
          onChange={(e) => this.setState({ searchTerm: e.target.value })}
          label="Search"
          icon="search"
        />
        <div
          className={cx("custom-color-inner-list", {
            "added-color": this.props.addedColor
          })}
        >
          {filteredRangeIndices.map(({ range, index }) => (
            <CustomColorsListItem
              additionalColors={this.props.additionalColors}
              chartId={this.props.chartId}
              colorValue={range}
              columnName={this.props.columnName}
              disableRemove={this.props.disableRemove}
              domainValue={String(this.props.domain[index]) || ""}
              hasAxisSelector={this.props.hasAxisSelector}
              hideAutocomplete={isD3ChartWithCustomDomainRange(
                this.props.chart
              )}
              id="custom-color"
              key={index}
              lineStyle={
                this.props.hasLineStyles ? this.props.lineStyles[index] : null
              }
              markType={this.getMarkType(index)}
              measureIndex={this.props.getTrueMeasureIndex(String(index))}
              palette={this.props.palette}
              removeColor={this.removeColor(index)}
              selectedOptions={this.props.domain} // so they're not allowed twice
              table={this.props.table}
              toggleYAxisOrientation={this.props.toggleYAxisOrientation}
              updateDomainValue={this.updateDomainValue(index)}
              updateLineStyleValue={this.updateLineStyleValue(index)}
              updateRangeValue={this.updateRangeValue(index)}
              hideOther={this.props.hideOther}
              updateHideOther={this.props.updateHideOther}
            />
          ))}
        </div>
        {!this.props.disableOthers && (
          <CustomColorsListItem
            additionalColors={this.props.additionalColors}
            colorValue={this.props.defaultOtherRange || ""}
            columnName={aliasDefaultOtherDomain(
              this.props.defaultOtherDomain || "",
              this.props.range.length,
              this.props.hasOther
            )}
            disableRemove={this.props.disableRemove}
            enabled={this.props.showOther}
            id="custom-color-other"
            lineStyle={
              this.props.hasLineStyles ? this.props.defaultOtherLineStyle : null
            }
            markType={this.getMarkType(0)}
            palette={this.props.palette}
            table={this.props.table}
            toggle={this.props.toggleOther}
            toggleYAxisOrientation={this.props.toggleYAxisOrientation}
            type={"defaultOther"}
            updateLineStyleValue={this.updateDefaultOtherLineStyle}
            updateRangeValue={this.updateDefaultOtherRangeValue}
            isOther={this.props.hasOther}
            disableToggle={true || this.props.disableToggle}
            hideOther={this.props.hideOther}
            updateHideOther={this.props.updateHideOther}
          />
        )}
        {!this.props.disableAdd && (
          <CustomColorsListItem
            addColor={this.props.addColor}
            buttonLabel={this.props.buttonLabel}
            columnName={this.props.columnName}
            id="custom-color"
            palette={this.props.palette}
            selectedOptions={this.props.domain}
            table={this.props.table}
            toggleYAxisOrientation={this.props.toggleYAxisOrientation}
            type={"add"}
            updateDomainValue={this.updateDomainValue(0)}
            hideOther={this.props.hideOther}
            updateHideOther={this.props.updateHideOther}
          />
        )}
      </div>
    )
  }
}
