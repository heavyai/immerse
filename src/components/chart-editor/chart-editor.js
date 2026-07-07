// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  chartShape,
  selectorPillHoverShape,
  measureShape,
  dimensionShape
} from "constants/prop-types"
import React from "react"
import PropTypes from "prop-types"
import ChartEditorDataSourcePrompt from "components/chart-editor-data-source-prompt/chart-editor-data-source-prompt"
import ChartEditorErrorMessage from "components/chart-editor-error-message/chart-editor-error-message"
import ChartSettings from "components/chart-settings/chart-settings"
import ChartTypePanel from "components/chart-type-panel/chart-type-panel"
import cx from "classnames"

import Icon from "components/icon/icon"
import LayerPicker from "components/layer-picker/layer-picker"
import LayerSelector from "components/layer-selector/layer-selector"

import ChartEditorTablePreview from "components/chart-editor-table-preview/chart-editor-table-preview-parent"

import {
  convertPositionalIndexMultiSourceIndex,
  isChartMultiSource
} from "reducers/charts/helpers/multi-source-helpers"
import { values } from "ramda"
import { isSelectorUsable } from "utils/selector-helpers"
import Logo from "components/logo/logo-parent"
import {
  ImmerseUIRequired,
  IMMERSE_UI_USER_DROPDOWN
} from "services/immerse-ui-provider"

import {
  NOT_BE_RENDERED_CHART_TYPES,
  isVegaChart,
  CHART_TYPES
} from "constants/charts"

import { isRasterPointChart } from "charts/raster-chart/raster-utils"

import MigrationRibbon from "components/migration/migration-ribbon"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"
const { ENABLE_CHART_SNAPSHOTS, GLOBAL_SIDE_NAV } = available_feature_flags

import { LegacyChartingDataSelectionPanel } from "./legacy-charting-data-selection-panel"
import AccountPanel from "components/account-panel/account-panel-parent"

import { PrimaryButton, SecondaryButton } from "widgets/button/Button"
import { CHART_TYPE_WINDBARB } from "charts/raster-chart/windbarb/constants"
import { isCrossSectionTerrainEnabled } from "charts/raster-chart/cross-section/hooks/use-cross-section-terrain-enabled"
import { isCrossSectionType } from "charts/raster-chart/cross-section/utils/is-cross-section-type"

const CHART_EDITOR_DATA_SELECTION_PANELS = {}
export const addChartDataSelectionPanel = (chartType, DataSelectionPanel) => {
  CHART_EDITOR_DATA_SELECTION_PANELS[chartType] = DataSelectionPanel
}

ChartEditor.propTypes = {
  chart: chartShape.isRequired,
  measures: PropTypes.arrayOf(measureShape).isRequired,
  dimensions: PropTypes.arrayOf(dimensionShape).isRequired,
  dispatch: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  isMultiSourceEnabled: PropTypes.bool.isRequired,
  isMultiLayeringEnabled: PropTypes.bool.isRequired,
  isPolyRasterEnabled: PropTypes.bool.isRequired,
  selectedMultiSourcePanel: PropTypes.number,
  selectorPillHover: selectorPillHoverShape.isRequired,
  shouldShowAddNewDataSourceButton: PropTypes.bool.isRequired,
  shouldShowDataSourcePrompt: PropTypes.bool.isRequired,
  shouldShowErrorDisplay: PropTypes.bool.isRequired,
  tablePreview: PropTypes.string
}

export const isMultiLayer = (chart, isPolyRasterEnabled) => {
  const isPolyRasterAndEnabled =
    isPolyRasterEnabled && chart.type === "backendChoropleth"

  const isCrossSectionAndEnabled =
    isCrossSectionType(chart.type) && isCrossSectionTerrainEnabled()

  const isMultiLayerType = [
    "geoheat",
    "pointmap",
    "linemap",
    "deckgl",
    "deckgl-pointmap",
    "deckgl-linemap",
    "deckgl-geoheat",
    "deckgl-choropleth",
    CHART_TYPES.CONTOUR,
    CHART_TYPE_WINDBARB
  ].includes(chart.type)
  return isMultiLayerType || isPolyRasterAndEnabled || isCrossSectionAndEnabled
}

function ChartEditorLeftPanel(props) {
  if (
    isMultiLayer(props.chart, props.isPolyRasterEnabled) &&
    props.chart.currentLayer === "master"
  ) {
    return <LayerSelector id={props.id} />
  } else {
    const DataSelectionPanel =
      CHART_EDITOR_DATA_SELECTION_PANELS[props.chart.type] ??
      LegacyChartingDataSelectionPanel
    return <DataSelectionPanel {...props} isMultiLayer={isMultiLayer} />
  }
}

export function ChartEditor({
  id,
  isMultiSourceEnabled,
  isMultiLayeringEnabled,
  isPolyRasterEnabled,
  tablePreview,
  chart,
  dispatch,
  shouldShowAddNewDataSourceButton,
  shouldShowErrorDisplay,
  shouldShowDataSourcePrompt,
  selectedMultiSourcePanel,
  selectorPillHover,
  dimensions,
  measures,
  supportsChartSpecificFilters,
  ...actions
}) {
  const saveButtonIsDisabled =
    shouldShowDataSourcePrompt ||
    shouldShowErrorDisplay ||
    tablePreview ||
    chart.hasError ||
    (!chart.isNotDc && chart.dcFlag === null)
  const layersEnabled =
    isMultiLayeringEnabled && isMultiLayer(chart, isPolyRasterEnabled)

  // TODO: multiSource
  // Is probably redundant with logic higher in tree and can be removed - investigate
  const uiMultiSourceModeEnabled = Boolean(
    isMultiSourceEnabled &&
      (values(chart.multiSources).length ||
        (isVegaChart(chart.type) && chart.dataSelections.length > 1))
  )

  // TODO, will remove the check once we apply postFilter to all charts
  const isPostFilterHavingSupported = Boolean(
    isRasterPointChart(chart.type) &&
      chart.dimensions.filter(isSelectorUsable).length
  )

  const layerPostFilter =
    chart.postFilters &&
    chart.layers &&
    chart.layers.length &&
    chart.layers[chart.currentLayer] &&
    chart.layers[chart.currentLayer].postFilters
      ? chart.layers[chart.currentLayer].postFilters
      : chart.postFilters

  const multiSourceIndex = isChartMultiSource(chart)
    ? convertPositionalIndexMultiSourceIndex(chart, selectedMultiSourcePanel)
    : "0"

  const isLineChart = chart.type === NOT_BE_RENDERED_CHART_TYPES.LINE
  const lineChartUpdate = () =>
    actions.updateChartType(id, NOT_BE_RENDERED_CHART_TYPES.LINE2)

  return (
    <div
      className={`chart-editor-container ${
        isMultiLayer(chart, isPolyRasterEnabled) ? "has-layers" : ""
      }`}
    >
      {shouldShowErrorDisplay && (
        <ChartEditorErrorMessage
          {...{
            chart,
            id,
            isMultiSourceEnabled
          }}
        />
      )}
      {shouldShowDataSourcePrompt && <ChartEditorDataSourcePrompt />}
      {tablePreview && (
        <div className="metadata-widget">
          <div className="metadata-wrapper">
            <ChartEditorTablePreview
              {...{
                name: tablePreview,
                showTableActions: false,
                key: tablePreview
              }}
            />
          </div>
        </div>
      )}
      {selectorPillHover && (
        <div
          className={cx("selector-require-popup", {
            showRequirePopup: selectorPillHover.shouldShowPrompt
          })}
          style={{ top: `${selectorPillHover.top}px` }}
        >
          <div className="required-field">
            <div className="required-text">{selectorPillHover.message}</div>
          </div>
        </div>
      )}
      <div className="chart-editor-top-panel">
        {isLineChart ? (
          <div className="line-chart-deprecated">
            <div>
              <button
                className="button icon-btn cancel"
                onClick={actions.cancelEditing}
              >
                <Icon name="arrow2" />
                {"Cancel"}
              </button>
            </div>
            <div className="line-chart-deprecated-message">
              <h3>We are no longer supporting this version of line chart.</h3>
              <p>
                As of 4.8 you will need to switch to combo chart to experience
                the latest features and improvements.
              </p>
            </div>
            <div>
              <button
                className="button primary save"
                id="switch-to-combo"
                data-testid="switch-to-combo"
                onClick={lineChartUpdate}
              >
                {"Switch to Combo Chart"}
              </button>
            </div>
          </div>
        ) : (
          <div className="chart-editor-top-panel-inner">
            {getFeatureFlag(GLOBAL_SIDE_NAV) ? (
              <>
                <Logo />
                <span
                  className="dashboard-link"
                  onClick={actions.cancelEditing}
                >
                  Dashboard
                </span>
              </>
            ) : (
              <button
                className="button icon-btn cancel"
                onClick={actions.cancelEditing}
              >
                <Icon name="arrow2" />
                {"Cancel"}
              </button>
            )}
            <ChartTypePanel
              {...{
                chart,
                id,
                uiMultiSourceModeEnabled,
                updateChart: actions.updateChart,
                updateChartType: actions.updateChartType
              }}
            />
            {getFeatureFlag(GLOBAL_SIDE_NAV) ? (
              <>
                <SecondaryButton
                  id="chart-edit-cancel"
                  data-testid="chart-edit-cancel"
                  onClick={actions.cancelEditing}
                >
                  {"Cancel"}
                </SecondaryButton>
                <PrimaryButton
                  id="chart-edit-apply"
                  data-testid="chart-edit-apply"
                  onClick={actions.saveChart}
                  disabled={saveButtonIsDisabled}
                >
                  {"Apply"}
                </PrimaryButton>
                <ImmerseUIRequired uiKey={IMMERSE_UI_USER_DROPDOWN}>
                  <AccountPanel />
                </ImmerseUIRequired>
              </>
            ) : (
              <PrimaryButton
                className="button primary save"
                data-testid="chart-edit-apply"
                id="chart-edit-apply"
                onClick={actions.saveChart}
                disabled={saveButtonIsDisabled}
              >
                {"Apply"}
              </PrimaryButton>
            )}
          </div>
        )}
        {getFeatureFlag(ENABLE_CHART_SNAPSHOTS) && <MigrationRibbon id={id} />}
      </div>
      {isMultiLayer(chart, isPolyRasterEnabled) && (
        <LayerPicker
          addLayer={actions.addLayer}
          chart={chart}
          currentLayer={chart.currentLayer}
          deleteLayer={actions.deleteLayer}
          dispatch={dispatch}
          id={id}
          layers={chart.layers}
          layersEnabled={layersEnabled}
          saveCurrentLayer={actions.saveCurrentLayer}
          showMaster={actions.showMaster}
          switchLayer={actions.switchLayer}
          updateChart={actions.updateChart}
          setLayerLabel={actions.setLayerLabel}
        />
      )}
      <div
        className="chart-editor-left-panel"
        data-testid="chart-editor-left-panel"
      >
        <ChartEditorLeftPanel
          actions={actions}
          chart={chart}
          id={id}
          isPolyRasterEnabled={isPolyRasterEnabled}
          isPostFilterHavingSupported={isPostFilterHavingSupported}
          layerPostFilter={layerPostFilter}
          shouldShowAddNewDataSourceButton={shouldShowAddNewDataSourceButton}
          tablePreview={tablePreview}
          uiMultiSourceModeEnabled={uiMultiSourceModeEnabled}
          supportsChartSpecificFilters={supportsChartSpecificFilters}
        />
      </div>
      <div
        className="chart-editor-right-panel"
        data-testid="chart-editor-right-panel"
      >
        <ChartSettings
          chart={chart}
          dimensions={dimensions}
          measures={measures}
          dispatch={dispatch}
          multiSourceIndex={multiSourceIndex}
          id={id}
          isPolyRasterEnabled={isPolyRasterEnabled}
          selectedMultiSourcePanel={selectedMultiSourcePanel}
          updateChart={actions.updateChart}
        />
      </div>
    </div>
  )
}
