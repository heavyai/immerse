// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { FILTER_PANEL_VIEWS } from "components/new-filters/filter-panel/constants"
import "./filter-panel-mode-toggle.scss"

const FilterPanelModeToggle = (props) => (
  <div className="filter-panel-mode-toggle-container">
    <div className="filter-panel-mode-toggle">
      {props.showAdvancedFilterControls ? (
        <>
          <div
            className={cx("filter-panel-mode", {
              selected: props.viewMode === FILTER_PANEL_VIEWS.FILTER_SETS
            })}
            onClick={() => props.changeViewMode(FILTER_PANEL_VIEWS.FILTER_SETS)}
            data-testid="filter-panel-mode-filters"
          >
            Filters
          </div>
          <div
            className={cx("filter-panel-mode", {
              disabled: props.disableCohortBuilder,
              selected: props.viewMode === FILTER_PANEL_VIEWS.COHORT_BUILDER
            })}
            onClick={() =>
              props.changeViewMode(FILTER_PANEL_VIEWS.COHORT_BUILDER)
            }
            data-testid="filter-panel-mode-cohort-builder"
          >
            Cohort builder
          </div>
        </>
      ) : (
        <div className="filter-panel-mode selected">Filters</div>
      )}
    </div>
  </div>
)

FilterPanelModeToggle.propTypes = {
  viewMode: PropTypes.string,
  changeViewMode: PropTypes.func
}

export default FilterPanelModeToggle
