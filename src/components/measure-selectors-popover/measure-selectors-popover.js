// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import MeasureAggTypeSelectorParent from "components/measure-aggtype-selector/measure-aggtype-selector-parent"
import { measureShape } from "constants/prop-types"
import Popover from "components/popover/popover"
import SelectorDropdown from "components/selector-dropdown/selector-dropdown"

MeasureSelectorsPopover.propTypes = {
  addCustomMeasure: PropTypes.func.isRequired,
  addCustomPostFilter: PropTypes.func.isRequired,
  chartId: PropTypes.string.isRequired,
  closeCustomSelector: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  isDropdownOpen: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  measure: measureShape.isRequired,
  onKeyDown: PropTypes.func,
  onOpenChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired
    })
  ).isRequired,
  setPropagation: PropTypes.func,
  shouldShowAggTypeSelector: PropTypes.bool.isRequired,
  shouldShowCustomInput: PropTypes.bool,
  stopEditingSelector: PropTypes.func,
  stopPropagation: PropTypes.func
}

export default function MeasureSelectorsPopover(props) {
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
      {!props.shouldShowCustomInput && (
        <SelectorDropdown
          hasSettings={
            props.shouldShowAggTypeSelector || props.shouldShowCustomInput
          }
          isDropdownOpen={props.isDropdownOpen}
          measure={props.measure}
          onOpenChange={props.onOpenChange}
          onValueChange={props.onValueChange}
          options={props.options}
          selector={props.measure}
          setPropagation={props.setPropagation}
          stopPropagation={props.stopPropagation}
          editParameterizedCustomSql={props.editParameterizedCustomSql}
        />
      )}
      {props.shouldShowAggTypeSelector && (
        <div className={"measure-settings-wrapper"}>
          <div className={"measure-settings"}>
            <MeasureAggTypeSelectorParent
              chartId={props.chartId}
              index={props.index}
              measure={props.measure}
            />
          </div>
        </div>
      )}
    </Popover>
  )
}
