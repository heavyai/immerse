// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import PropTypes from "prop-types"

import { Tooltip } from "@rmwc/tooltip"
import Icon from "components/icon/icon"
import { Icon as RMWCIcon } from "@rmwc/icon"
import {
  pauseCrossFilter,
  isCrossFilterPaused
} from "services/ConnectorWithQueue"
import cx from "classnames"
import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import "@rmwc/icon/icon.css"

const FilterSetsCrossFilter = (props) => {
  const { clearFilterSetCrossFilters, omnifilters, selectedFilterSet } = props
  const [paused, setPaused] = useState(isCrossFilterPaused())

  const hasCrossFilters =
    selectedFilterSet &&
    Boolean(
      omnifilters.find(
        (f) => f.appliesTo === "CROSSFILTER" && f.enabled === true
      )
    )

  const clearCrossFilters = (selectedFilterSetId) => {
    if (hasCrossFilters) {
      clearFilterSetCrossFilters(selectedFilterSetId)
    }
  }

  return (
    <>
      {!getFeatureFlag(available_feature_flags.KIOSK_MODE) && (
        <Tooltip content={"Clear crossfilters"} enterDelay={500} align="right">
          <div
            className={cx("clear-cross-filters", {
              disabled: !hasCrossFilters
            })}
            id="dashboard-clear-cross-filters"
            onClick={() => clearCrossFilters(selectedFilterSet.id)}
          >
            <Icon name="filter-x" />
          </div>
        </Tooltip>
      )}
      {getFeatureFlag(available_feature_flags.CROSSFILTER_PAUSE_BUTTON) && (
        <>
          <Tooltip
            content={paused ? "Run crossfilter" : "Pause crossfilter"}
            enterDelay={500}
            align="right"
          >
            <div
              className={"clear-cross-filters"}
              style={{ width: "24px", height: "36px" }}
              onClick={() => {
                pauseCrossFilter(!paused)
                setPaused(!paused)
                // if it's currently paused, then we're unpausing so redraw everything.
                if (paused) {
                  props.redrawAll("the-entire-dashboard", true)
                }
              }}
            >
              <RMWCIcon
                icon={paused ? "play_arrow" : "pause"}
                className="icon"
                style={{ fill: "#aaa !important" }}
              />
            </div>
          </Tooltip>
          {getFeatureFlag(available_feature_flags.REFRESH_COHORTS_BUTTON) && (
            <Tooltip content="Refresh cohorts" enterDelay={500} align="right">
              <div
                className={"clear-cross-filters"}
                style={{ width: "24px", height: "36px" }}
                onClick={() => {
                  window.refreshCohorts()
                }}
              >
                <RMWCIcon
                  icon={"refresh"}
                  className="icon"
                  style={{ fill: "#aaa !important" }}
                />
              </div>
            </Tooltip>
          )}
        </>
      )}
    </>
  )
}

FilterSetsCrossFilter.proptypes = {
  clearFilterSetCrossFilters: PropTypes.func.isRequired,
  omnifilters: PropTypes.arrayOf(PropTypes.object),
  selectedFilterSet: PropTypes.object
}

export default FilterSetsCrossFilter
