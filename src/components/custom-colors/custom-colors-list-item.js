// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import AutocompleteParent from "components/autocomplete/autocomplete-parent"
import { compose } from "recompose"
import CustomColorsPopup from "./custom-colors-popup"
import CustomColorsSwatch from "./custom-colors-swatch"
import cx from "classnames"
import Icon from "components/icon/icon"
import { KEYCODE } from "constants/keycode"
import { LINE_STYLES } from "constants/charts"
import Popover from "components/popover/popover"
import Toggle from "react-toggle"
import withAutosuggestState from "components/autosuggest/with-autosuggest-state"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import Services from "services/immerse"
import { colorShape } from "constants/prop-types"
import { CustomColorsComboPopup } from "./custom-colors-combo-popup"
import Portal from "components/portal/Portal"
import { MenuSurface, MenuSurfaceAnchor } from "@rmwc/menu"

// This portal element is used to render autocomplete above the scrollable inner list
export const COLUMN_AUTOCOMPLETE_PORTAL_ID = "column-autocomplete-portal-root"

function isNotUndefined(arr) {
  return typeof arr !== "undefined"
}

function filterSelectedOptions(selectedOptions, options) {
  return options.filter(
    (option) => !(selectedOptions || []).includes(option.value) // option value will be the true value
  )
}

export class CustomColorsListItem extends Component {
  static propTypes = {
    addColor: PropTypes.func,
    autosuggest: PropTypes.func,
    autosuggestedOptions: PropTypes.object.isRequired,
    buttonLabel: PropTypes.string,
    chartId: PropTypes.string,
    colorValue: PropTypes.string,
    columnName: PropTypes.string,
    disableRemove: PropTypes.bool,
    disableToggle: PropTypes.bool,
    domainValue: PropTypes.string,
    enabled: PropTypes.bool,
    hasAxisSelector: PropTypes.bool,
    hideAutocomplete: PropTypes.bool,
    id: PropTypes.string,
    isOther: PropTypes.bool,
    lineStyle: PropTypes.oneOf(LINE_STYLES),
    markType: PropTypes.string,
    measureIndex: PropTypes.string,
    palette: colorShape,
    removeColor: PropTypes.func,
    selectedOptions:
      PropTypes.arrayOf(PropTypes.string.isRequired) ||
      PropTypes.arrayOf(PropTypes.bool.isRequired),
    table: PropTypes.string,
    toggle: PropTypes.func,
    toggleYAxisOrientation: PropTypes.func,
    type: PropTypes.string,
    updateDomainValue: PropTypes.func,
    updateLineStyleValue: PropTypes.func,
    updateRangeValue: PropTypes.func,
    hideOther: PropTypes.bool,
    updateHideOther: PropTypes.func
  }

  state = {
    showSwatch: false,
    showAutosuggest: false
  }

  componentDidMount() {
    if (this.props.type === "add") {
      this.setCardinality()
    }
  }

  async setCardinality() {
    // TODO[C]: need to safeguard this query, this.props.columnname is undefined for d3
    this.setState({ loading: true })
    const cardinalityQuery = process(
      `SELECT APPROX_COUNT_DISTINCT(${this.props.columnName}) AS num FROM ${this.props.table}`,
      { trackUsage: false }
    )

    try {
      const connector = Services.get("DbCon")
      const cardinality = await connector.queryAsync(cardinalityQuery)
      this.setState({
        cardinality: cardinality[0].num
      })
    } catch {
      this.setState({
        cardinality: -1
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  showSwatchPopup = () => {
    const { type, enabled } = this.props
    if (type === "toggle" && !enabled) {
      return
    }
    this.setState({
      showSwatch: true
    })
  }

  closeSwatchPopup = () => {
    this.setState({
      showSwatch: false
    })
  }

  showAutosuggest = () => {
    if (!this.props.hideAutocomplete && this.props.columnName) {
      // A null value for columnName indicates we're coloring by Measure,
      // not a Color Dimension. We don't want to show the drop down in this case.
      this.props.autosuggest("", this.props.columnName, this.props.table)
      this.setState({
        showAutosuggest: true
      })
    }
  }

  closeAutosuggest = () => {
    this.setState({
      showAutosuggest: false
    })
  }

  handleValueChange = (option) => {
    this.props.updateDomainValue(option.value)
  }

  handleNewColor = async (option) => {
    this.props.addColor(option.value)

    // If the last option is added from autocomplete dropdown,
    // there is no more option left to be considered a part of Other category
    // Thus, set color.hideOthers to true
    if (
      this.state.cardinality > -1 &&
      this.state.cardinality - this.props.selectedOptions.length <= 1 &&
      !this.props.hideOther
    ) {
      this.props.updateHideOther(true)
    }
  }

  colorPopupHandleKeyDown = (e) => {
    if (e.keyCode === KEYCODE.Esc || e.keyCode === KEYCODE.Enter) {
      this.closeSwatchPopup()
    }
  }

  renderOption = (item) => (
    <div className={"autocomplete-dropdown-item-content"}>
      <div className={"value"}>{item.label}</div>
      <div className={"meta"}>{item.count}</div>
    </div>
  )

  getElementOffsetById = (id) => {
    return document.getElementById(id)?.getBoundingClientRect()?.top ?? 0
  }

  render() {
    const options = this.props.autosuggestedOptions[this.props.columnName]

    if (this.props.type === "defaultOther") {
      const isDisabled = this.props.isOther && !this.props.enabled
      return (
        !this.props.hideOther && (
          <div
            className={cx("custom-colors-item other", { disabled: isDisabled })}
          >
            <CustomColorsSwatch
              colorValue={this.props.colorValue}
              id={this.props.id}
              isDisabled={isDisabled}
              lineStyle={this.props.lineStyle}
              onClick={this.showSwatchPopup}
            />
            <div className={"custom-colors-label other-label"}>
              <span>{this.props.columnName}</span>
            </div>

            {this.props.isOther && (
              <Toggle
                checked={this.props.enabled}
                disabled={this.props.disableToggle}
                id={`${this.props.id}-toggle`}
                onChange={this.props.toggle}
              />
            )}

            <Popover
              isOpened={this.state.showSwatch}
              onClose={this.closeSwatchPopup}
              onKeyDown={this.colorPopupHandleKeyDown}
              className={cx({ "combo-popover": this.props.palette })}
            >
              {this.props.palette ? (
                <CustomColorsComboPopup
                  additionalColors={this.props.additionalColors}
                  chartId={this.props.chartId}
                  chooseColor={this.props.updateRangeValue}
                  chooseLineStyle={this.props.updateLineStyleValue}
                  hasAxisSelector={this.props.hasAxisSelector}
                  measureIndex={this.props.measureIndex}
                  lineStyle={this.props.lineStyle}
                  markType={this.props.markType}
                  palette={this.props.palette}
                  selectedColor={this.props.colorValue}
                  toggleYAxisOrientation={this.props.toggleYAxisOrientation}
                />
              ) : (
                <CustomColorsPopup
                  chooseColor={this.props.updateRangeValue}
                  chooseLineStyle={this.props.updateLineStyleValue}
                  lineStyle={this.props.lineStyle}
                  markType={this.props.markType}
                  palette={this.props.palette}
                  selectedColor={this.props.colorValue}
                  toggleYAxisOrientation={this.props.toggleYAxisOrientation}
                />
              )}
            </Popover>
          </div>
        )
      )
    } else if (this.props.type === "add") {
      return (
        <div
          className={cx("custom-color-add-row", {
            disabled: this.state.loading
          })}
        >
          <button
            className="button add-color"
            id={`${this.props.id}-add`}
            onClick={this.showAutosuggest}
          >
            {`+ Add ${this.props.buttonLabel}`}
          </button>
          {this.state.showAutosuggest && isNotUndefined(options) && (
            <AutocompleteParent
              forceComplete
              onExit={this.closeAutosuggest}
              openByDefault
              options={filterSelectedOptions(
                this.props.selectedOptions,
                options
              )}
              renderOption={this.renderOption}
              updateInputValue={(inputValue) => {
                this.props.autosuggest(
                  inputValue,
                  this.props.columnName,
                  this.props.table
                )
              }}
              updateValue={this.handleNewColor}
              testid={"add-color-autocomplete"}
              updateOptionsOnPropsChange
            />
          )}
        </div>
      )
    } else {
      const itemOffsetTop = this.getElementOffsetById(
        `${this.props.id}-value-${this.props.measureIndex}`
      )
      const portalRootOffsetTop = this.getElementOffsetById(
        COLUMN_AUTOCOMPLETE_PORTAL_ID
      )
      const offsetTop = itemOffsetTop - portalRootOffsetTop
      return (
        <div className={"custom-colors-item"} data-testid="custom-colors-item">
          <MenuSurfaceAnchor className="custom-swatch">
            <MenuSurface
              hoistToBody
              open={this.state.showSwatch}
              onClose={this.closeSwatchPopup}
              className={cx({ "combo-popover": this.props.palette })}
            >
              {this.state.showSwatch &&
                (this.props.palette ? (
                  <CustomColorsComboPopup
                    additionalColors={this.props.additionalColors}
                    chartId={this.props.chartId}
                    chooseColor={this.props.updateRangeValue}
                    chooseLineStyle={this.props.updateLineStyleValue}
                    hasAxisSelector={this.props.hasAxisSelector}
                    measureIndex={this.props.measureIndex}
                    lineStyle={this.props.lineStyle}
                    markType={this.props.markType}
                    palette={this.props.palette}
                    selectedColor={this.props.colorValue}
                    toggleYAxisOrientation={this.props.toggleYAxisOrientation}
                  />
                ) : (
                  <CustomColorsPopup
                    chartId={this.props.chartId}
                    chooseColor={this.props.updateRangeValue}
                    chooseLineStyle={this.props.updateLineStyleValue}
                    hasAxisSelector={this.props.hasAxisSelector}
                    measureIndex={this.props.measureIndex}
                    lineStyle={this.props.lineStyle}
                    markType={this.props.markType}
                    palette={this.props.palette}
                    selectedColor={this.props.colorValue}
                    toggleYAxisOrientation={this.props.toggleYAxisOrientation}
                  />
                ))}
            </MenuSurface>
            <CustomColorsSwatch
              colorValue={this.props.colorValue}
              id={this.props.id}
              measureIndex={this.props.measureIndex}
              lineStyle={this.props.lineStyle}
              onClick={this.showSwatchPopup}
            />
          </MenuSurfaceAnchor>
          <div
            className={cx("custom-colors-label", {
              "custom-colors-label--no-hover": this.props.hideAutocomplete
            })}
            id={`${this.props.id}-value-${this.props.measureIndex}`}
            onClick={this.showAutosuggest}
          >
            <span>
              {process(this.props.domainValue, { useDisplayName: true })}
            </span>
          </div>
          {this.state.showAutosuggest && isNotUndefined(options) && (
            <Portal
              rootId={COLUMN_AUTOCOMPLETE_PORTAL_ID}
              offsetTop={offsetTop}
            >
              <AutocompleteParent
                forceComplete
                onExit={this.closeAutosuggest}
                openByDefault
                options={filterSelectedOptions(
                  this.props.selectedOptions,
                  options
                )}
                renderOption={this.renderOption}
                updateValue={this.handleValueChange}
                testid={"custom-color-autocomplete"}
              />
            </Portal>
          )}
          {!this.props.disableRemove && (
            <button
              className={"remove button"}
              id={`${this.props.id}-delete-${this.props.measureIndex}`}
              onClick={this.props.removeColor}
            >
              <Icon name="x" />
            </button>
          )}
        </div>
      )
    }
  }
}

export default compose(withAutosuggestState)(CustomColorsListItem)
