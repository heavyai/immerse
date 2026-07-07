// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"

import { addChartLabelsIcons } from "components/chart-editor-error-message/chart-editor-error-message-icons"
import { addChartComponent } from "charts/components/registered-components"
import { addIcon } from "components/svg-icons"
import { addTypeAlias } from "components/chart-type-button/chart-type-button-type-aliases"
import { addChartDefaultColors } from "services/colors"
import { addChartSettingsComponent } from "components/chart-settings/chart-settings-components"
import { addChartDataSelectionPanel } from "components/chart-editor/chart-editor"
import { addChartType } from "constants/chart-types"
import { addDataAlias } from "constants/data-aliases"
import { registerAPIChartDataFormatter } from "services/external-messenger-api/api/getChartData"
import { addInitialChartData } from "./utils/initialize-new-chart"
import { addCleanupChartData } from "./utils/cleanup-chart-data"
import { addChartVersion, getChartVersion } from "./utils/chart-versioning"
import { addChartDataExporter } from "components/chart-container-header/export-chart-data"
import {
  registerAPIMessages,
  registerExposedAPISchema
} from "services/external-messenger-api/ExternalMessenger"
import { registerCrossFilterOverrides } from "services/ImmerseCrossFilter"
import {
  registerChartTypeAddons,
  getChartAddonTypes
} from "chart-addons/chart-addon-registry"

const { CHART_ADDON_EXPORT_AS_IMAGE } = getChartAddonTypes()

const defaultAddons = [CHART_ADDON_EXPORT_AS_IMAGE]

export const registerChart = (chartDef) => {
  if (chartDef.labelsIcons) {
    addChartLabelsIcons(chartDef.type, chartDef.labelsIcons)
  }
  if (chartDef.Component) {
    addChartComponent(chartDef.type, chartDef.Component)
  }

  if (chartDef.iconId && chartDef.IconComponent) {
    addIcon(chartDef.iconId, chartDef.IconComponent)
  }

  if (chartDef.typeAlias) {
    addTypeAlias(chartDef.type, chartDef.typeAlias)
  }

  if (chartDef.defaultColors) {
    addChartDefaultColors(chartDef.type, chartDef.defaultColors)
  }

  if (chartDef.ChartSettingsComponent) {
    addChartSettingsComponent(chartDef.type, chartDef.ChartSettingsComponent)
  }

  if (chartDef.DataSelectionPanel) {
    addChartDataSelectionPanel(chartDef.type, chartDef.DataSelectionPanel)
  }

  if (chartDef.chartDataFormatter) {
    registerAPIChartDataFormatter(chartDef.type, chartDef.chartDataFormatter)
  }

  if (chartDef.externalAPI) {
    registerAPIMessages(chartDef.externalAPI)
  }

  if (chartDef.externalAPISchema) {
    Object.entries(chartDef.externalAPISchema).forEach(([message, schema]) => {
      registerExposedAPISchema(message, schema)
    })
  }

  if (chartDef.crossfilterOverrides) {
    registerCrossFilterOverrides(chartDef.type, chartDef.crossfilterOverrides)
  }

  addChartVersion(chartDef.type, chartDef.version, chartDef.versionUpgrader)
  const { version } = getChartVersion(chartDef.type)

  addInitialChartData(chartDef.type, {
    version,
    type: chartDef.type,
    isNotDc: chartDef.isNotDc,
    color: chartDef.defaultColors,
    ...(chartDef.initialChartData || {})
  })

  if (chartDef.cleanupChartData) {
    addCleanupChartData(chartDef.type, chartDef.cleanupChartData)
  }

  const dimensionSettings =
    typeof chartDef.dimensionSettings === "function"
      ? chartDef.dimensionSettings()
      : chartDef.dimensionSettings

  if (dimensionSettings?.aliases?.measures) {
    addDataAlias(chartDef.type, dimensionSettings.aliases.measures)
  }

  const disableAddons = new Set(chartDef.disableAddons || [])

  const addons = [...defaultAddons, ...(chartDef.addons || [])].filter(
    (addon) => !disableAddons.has(addon)
  )

  if (addons.length) {
    registerChartTypeAddons(chartDef.type, addons)
  }

  if (chartDef.exportChartData) {
    addChartDataExporter(chartDef.type, chartDef.exportChartData)
  }

  const isHiddenChartType =
    APP_CONFIG?.hidden_charts?.indexOf(chartDef.type) >= 0

  addChartType({
    chartType: chartDef.type,
    chartTypeConstant: chartDef.typeConstant,
    chartTypeCategories: chartDef.chartTypeCategories,
    dimensionSettings,
    visible: chartDef.visible && !isHiddenChartType,
    chartDef
  })
}
