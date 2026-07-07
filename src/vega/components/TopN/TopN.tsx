// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, FormEvent, useState } from "react"
import { TextField } from "@rmwc/textfield"

import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { VegaCustomizableTopNOptions } from "vega/charts/types"
import {
  CUSTOM_SQL_SELECTOR_TYPE,
  Column,
  Expression
} from "vega/constants/data-selection-types"

import {
  ApplyToTopNOptions,
  OnApplyActionTypes
} from "actions/category-selection-modal-action-creators"
import { getSelectorLabel } from "vega/utils/data-selection"
import { topNLegendSort } from "vega/charts/top-n-utils"

import NumericalSlider from "vega/components/NumericalSlider"
import TopNItem from "./TopNItem"
import SortTopNSelector from "vega/components/SortTopN"
import { Switch } from "widgets/switch/Switch"

import { HEAVYAI_TOPN_COLORS } from "services/colors"

import "./styles.scss"
import { MAX_NUM_DYNAMIC_VALUES } from "./topn-constants"
import EditChartIcon from "components/chart-container-header/edit-chart-icon"
import { SimpleColorPalette } from "components/ui-config-panel/types"

/** These are the props that are passed to the component */
type OwnProps = {
  /** Chart ID */
  chartId: string

  /** layer id */
  layerId: string

  /** Property to update in redux (ie, charts[X].propertyName) */
  propertyName: string
}

/** These props come from redux via react-redux */
type StateProps = {
  /** These are the options that modify the topn values. Specifically:
   *  - the measure used to sort topN values
   *  - whether to sort ascending or descending
   *  - the number of topN values
   *  - Static, dynamic, and allOthers values
   */
  options: VegaCustomizableTopNOptions

  /** Dimension/Measure for top-n */
  selector: Expression

  /** Data about the top-n keys, their order, color, etc */
  data: Array<Record<string, any>>

  /** all columns from the table selection */
  columns: Column[]

  // Color palettes to use for TopN Colors
  colors: SimpleColorPalette

  invertOrder: boolean

  disabled: boolean
  canLock: boolean
  hasSettings: boolean

  actions: {
    lock(
      chartId: string,
      layerId: string,
      propertyName: string,
      key: string,
      color: string,
      disabled?: boolean
    ): void
    setOptions(
      chartId: string,
      layerId: string,
      propertyName: string,
      options: VegaCustomizableTopNOptions
    ): void
    toggle(
      chartId: string,
      layerId: string,
      propertyName: string,
      key: string
    ): void
    toggleAllOthers(
      chartId: string,
      layerId: string,
      propertyName: string
    ): void
    unlock(
      chartId: string,
      layerId: string,
      propertyName: string,
      key: string
    ): void
    updateN(
      chartId: string,
      layerId: string,
      propertyName: string,
      n: number
    ): void
    changeColor(
      chartId: string,
      layerId: string,
      propertyName: string,
      key: string,
      color: string,
      isAllOther?: boolean,
      isMeasure?: boolean
    ): void
    showAllOthersInLegend(
      chartId: string,
      layerId: string,
      enabled: boolean
    ): void
    allowNullKeys(chartId: string, layerId: string, enabled: boolean): void
    openCategorySelectionModal(
      dataSource: string,
      column: string,
      onApplyAction: ApplyToTopNOptions,
      previousSelections?: string[],
      modalTitle?: string
    ): void
  }
}

export type Props = StateProps & OwnProps

const TopNComponent: FC<Props> = ({
  actions,
  chartId,
  layerId,
  data,
  selector,
  propertyName,
  options = { allOthers: { disabled: false } },
  colors,
  invertOrder,
  customRange,
  disabled = false,
  canLock = true,
  hasSettings = true
}) => {
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState("")

  if (!data) {
    return null
  }

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen)
  }
  const getSelectorValue = () => {
    return selector.type === CUSTOM_SQL_SELECTOR_TYPE
      ? selector.sql
      : selector.column?.value
  }

  const clickManualSelection = () => {
    const previousSelections = data
      .filter((d) => d.locked)
      .map((d) => d.originalKey)
    actions.openCategorySelectionModal(
      selector.table,
      getSelectorValue(),
      {
        type: OnApplyActionTypes.APPLY_TO_TOP_N,
        chartId,
        layerId,
        propertyName,
        topNData: data,
        topNOptions: options
      },
      previousSelections,
      "Select TopN static values"
    )
  }

  const topNItems = data
    .filter((datum) => {
      return (
        !datum.isAllOther &&
        // First render can have incomplete data, and no original key
        // If agg is switched from # Unique to Mode, the first render after switching will
        // still be using the numeric data as originalKey, so toLowerCase won't exist, hence
        // forcing it into a string.
        Boolean(
          searchTerm?.length
            ? `${datum.originalKey}`
                .toLowerCase()
                ?.includes(searchTerm.toLowerCase())
            : true
        )
      )
    })
    .sort(topNLegendSort(invertOrder))
    .map((datum) => (
      <TopNItem
        canLock={canLock}
        key={datum.key}
        color={disabled ? HEAVYAI_TOPN_COLORS.disabled : datum.color}
        visible={!datum.disabled}
        locked={datum.locked}
        title={datum.originalKey}
        value={datum.val}
        onToggle={(key) => actions.toggle(chartId, layerId, propertyName, key)}
        onLock={(key, color, itemVisible) =>
          actions.lock(chartId, layerId, propertyName, key, color, !itemVisible)
        }
        onUnlock={(key) => actions.unlock(chartId, layerId, propertyName, key)}
        onChangeColor={(key, color) =>
          actions.changeColor(chartId, layerId, propertyName, key, color)
        }
        colorPalette={colors}
        disabled={disabled}
        customRange={customRange}
      />
    ))

  const { showAllOthersInLegend = true, allowNullKeys = true } = options

  const allOthersItem = !showAllOthersInLegend ? null : (
    <TopNItem
      canLock={canLock}
      color={disabled ? HEAVYAI_TOPN_COLORS.disabled : options.allOthers.color}
      colorPalette={colors}
      visible={!options.allOthers.disabled}
      key={options.allOthers.key}
      title="All Others"
      onToggle={() => actions.toggleAllOthers(chartId, layerId, propertyName)}
      onChangeColor={(key, color) =>
        actions.changeColor(
          chartId,
          layerId,
          propertyName,
          key,
          color,
          options.allOthers.isAllOther
        )
      }
      disabled={disabled}
      isAllOther={options.allOthers.isAllOther}
    />
  )

  return (
    <div className="top-n-component" data-testid="top-n-component">
      <div className="top-n-header">
        <div className="top-n-header-left">
          {process(getSelectorLabel(selector), { useDisplayName: true })}
        </div>
        {hasSettings && (
          <div className="top-n-header-right">
            <EditChartIcon
              className="open-top-n-settings-button"
              onClick={toggleSettings}
            />
          </div>
        )}
      </div>
      {settingsOpen && (
        <div className="top-n-settings">
          <div className="legend-toggles">
            <div className="legend-toggle">
              <div>{`Show "All Others"`}</div>
              <Switch
                checked={showAllOthersInLegend}
                className="compact"
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  actions.showAllOthersInLegend(
                    chartId,
                    layerId,
                    Boolean(e.currentTarget.checked)
                  )
                }}
              />
            </div>
            <div className="legend-toggle">
              <div>
                Include <i>null</i> dynamic values
              </div>
              <Switch
                checked={allowNullKeys}
                className="compact"
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  actions.allowNullKeys(
                    chartId,
                    layerId,
                    Boolean(e.currentTarget.checked)
                  )
                }}
              />
            </div>
          </div>
          <SortTopNSelector chartId={chartId} layerId={layerId} />
          <NumericalSlider
            label="Dynamic Values"
            max={MAX_NUM_DYNAMIC_VALUES}
            min={0}
            step={1}
            value={options.n}
            onChange={(n: number) =>
              actions.updateN(chartId, layerId, propertyName, n)
            }
          />
          <div
            onClick={clickManualSelection}
            className="manual-selection-button"
          >
            + Add values manually
          </div>
        </div>
      )}
      <TextField
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value ?? "")}
        label="Search"
        icon="search"
        className="top-n-search"
      />
      <div className="top-n-values">
        {invertOrder ? [allOthersItem, topNItems] : [topNItems, allOthersItem]}
      </div>
    </div>
  )
}

export default TopNComponent
