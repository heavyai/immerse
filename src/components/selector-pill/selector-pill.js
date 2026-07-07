// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"
import PropTypes from "prop-types"
import { aggTypeShape } from "constants/prop-types"
import cx from "classnames"
import { dropLast } from "ramda"
import Icon from "components/icon/icon"

SelectorPill.propTypes = {
  aggType: aggTypeShape,
  alias: PropTypes.string,
  binIntervalLabel: PropTypes.string.isRequired,
  dataSource: PropTypes.string,
  extract: PropTypes.bool.isRequired,
  handleSelectorClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  index: PropTypes.number,
  isBinned: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  isRequired: PropTypes.bool.isRequired,
  isTime: PropTypes.bool.isRequired,
  label: PropTypes.string,
  makeDraggable: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
  selectorIsDisabled: PropTypes.bool,
  selectorType: PropTypes.oneOf(["measures", "dimensions", "postFilters"])
    .isRequired,
  shouldShowAggType: PropTypes.bool,
  shouldShowCustom: PropTypes.bool,
  style: PropTypes.string.isRequired
}

export function SelectorPill({
  alias,
  aggType,
  binIntervalLabel,
  dataSource,
  isDragging,
  shouldShowAggType,
  shouldShowCustom,
  handleSelectorClick,
  handleAggClick,
  isBinned,
  index,
  extract,
  isTime,
  onRemoveClick,
  selectorType,
  makeDraggable,
  style,
  selectorIsDisabled,
  processedLabel
}) {
  return (
    <div className={style}>
      {alias && <button className="button selector-label">{alias}</button>}
      {makeDraggable(
        <div
          className={cx("drag-area", { "is-dragging": isDragging })}
          style={{ width: alias ? "186px" : "234px" }}
          title={`${
            shouldShowAggType && !shouldShowCustom ? `${aggType} ` || "" : ""
          }${processedLabel || ""}`}
        >
          {shouldShowCustom && (
            <div
              className="button selector-agg normalcase"
              onClick={handleSelectorClick}
            >
              F(x)
            </div>
          )}
          {shouldShowAggType && !shouldShowCustom && (
            <div className="button selector-agg" onClick={handleAggClick}>
              {aggType}
            </div>
          )}
          {isBinned && (
            <div
              className={cx("button selector-agg bin", {
                inactive: !dataSource || selectorIsDisabled
              })}
              onClick={handleAggClick}
            >
              {extract ? "EXT" : "BIN"}
            </div>
          )}
          <div
            className={cx("selector-box button", {
              "custom-measure-label": shouldShowCustom,
              binning: isBinned,
              inactive: !dataSource || selectorIsDisabled
            })}
            id={
              shouldShowCustom || processedLabel
                ? `${dropLast(1, selectorType)}-${index}`
                : `${dropLast(1, selectorType)}-add-${index}`
            }
            data-testid="column-selector-select-button"
            onClick={handleSelectorClick}
          >
            <span className="selector-label-ellipse">
              {processedLabel ||
                `+ add ${dropLast(
                  1,
                  selectorType === "postFilters" ? "filters" : selectorType
                )}`}
            </span>
            {isBinned && isTime && binIntervalLabel !== "auto" && (
              <div className="bin-interval">
                <span>{binIntervalLabel}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {processedLabel && (
        <button
          data-testid="column-selector-remove-button"
          className="button remove icon-btn"
          id={`${dropLast(1, selectorType)}-${index}-delete`}
          onClick={onRemoveClick}
          style={{ display: "inline" }}
        >
          <Icon name="x" />
        </button>
      )}
    </div>
  )
}

export default function DraggableSelectorPill({ makeDroppable, ...props }) {
  return makeDroppable(SelectorPill(props))
}
