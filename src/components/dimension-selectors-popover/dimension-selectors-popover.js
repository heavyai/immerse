// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { chartTypeShape, dimensionShape } from "constants/prop-types"
import React from "react"
import PropTypes from "prop-types"
import DimensionBinSettingsParent from "components/dimension-bin-settings/dimension-bin-settings-parent"
import DimensionTimeBinSettings from "components/dimension-time-bin-settings/dimension-time-bin-settings"
import Popover from "components/popover/popover"
import SelectorDropdown from "components/selector-dropdown/selector-dropdown"

DimensionSelectorsPopover.propTypes = {
  addCustomDimension: PropTypes.func.isRequired,
  binBounds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.instanceOf(Date)])
  ),
  chartId: PropTypes.string.isRequired,
  chartType: chartTypeShape,
  closeCustomSelector: PropTypes.func.isRequired,
  dimension: dimensionShape.isRequired, // dimension object at index of measures array
  index: PropTypes.number.isRequired,
  isDropdownOpen: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  onKeyDown: PropTypes.func,
  onOpenChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  setPropagation: PropTypes.func,
  shouldShowCustomInput: PropTypes.bool,
  showBinSettings: PropTypes.bool.isRequired,
  showCustomInput: PropTypes.bool.isRequired,
  showCustomSQLSelector: PropTypes.func.isRequired,
  showDropDown: PropTypes.bool.isRequired,
  showTimeBinSettings: PropTypes.bool.isRequired,
  stopEditingSelector: PropTypes.func,
  stopPropagation: PropTypes.func,
  submitCustomDimension: PropTypes.func.isRequired,
  timeBinInputVal: PropTypes.string,
  updateBinInterval: PropTypes.func.isRequired,
  updateExtractInterval: PropTypes.func.isRequired
}

export default function DimensionSelectorsPopover(props) {
  return (
    <Popover
      isOpened
      onClose={props.stopEditingSelector}
      onKeyDown={props.onKeyDown}
    >
      {props.loading && (
        <div>
          <div className={"selector-loading"}>
            <div className="loading-gfx">
              <div className="main-loading-icon" />
            </div>
          </div>
        </div>
      )}
      {props.showDropDown && (
        <SelectorDropdown
          dimension={props.dimension}
          hasSettings={
            props.dimension.isBinnable || props.shouldShowCustomInput
          }
          isDropdownOpen={props.isDropdownOpen}
          onOpenChange={props.onOpenChange}
          onValueChange={props.onValueChange}
          options={props.options}
          selector={props.dimension}
          setPropagation={props.setPropagation}
          showCustomSQLSelector={props.showCustomSQLSelector}
          editParameterizedCustomSql={props.editParameterizedCustomSql}
          stopPropagation={props.stopPropagation}
        />
      )}
      {props.showBinSettings && (
        <div className={"measure-settings-wrapper"}>
          <div className={"measure-settings"}>
            <DimensionBinSettingsParent
              chartId={props.chartId}
              chartType={props.chartType}
              dimension={props.dimension}
              index={props.index}
              setPropagation={props.setPropagation}
              stopPropagation={props.stopPropagation}
            />
          </div>
        </div>
      )}
      {props.showTimeBinSettings && (
        <div className={"measure-settings-wrapper"}>
          <div className={"measure-settings"}>
            <DimensionTimeBinSettings
              binBounds={props.binBounds}
              chartType={props.chartType}
              dimension={props.dimension}
              setPropagation={props.setPropagation}
              stopPropagation={props.stopPropagation}
              timeBinInputVal={props.timeBinInputVal}
              updateBinInterval={props.updateBinInterval}
              updateExtractInterval={props.updateExtractInterval}
            />
          </div>
        </div>
      )}
    </Popover>
  )
}
