// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

import { Icon } from "@rmwc/icon"

import {
  getFeatureFlag,
  available_feature_flags
} from "components/control-panel/featureflags"

import { registerChartAddon } from "chart-addons/chart-addon-registry"

import { getChartImageUrl } from "./get-chart-image-url"
import { isUserExportDisabled } from "utils/user"

const { ENABLE_CHART_IMAGE_EXPORT } = available_feature_flags

export const exportAsImage = async (id, selector, exportId) => {
  const elementId = exportId || `chart${id}`

  const url = await getChartImageUrl(elementId, selector)
  const fakeLink = window.document.createElement("a")
  fakeLink.style = "display:none;"
  fakeLink.download = `${elementId}.png`

  fakeLink.href = url

  document.body.appendChild(fakeLink)
  fakeLink.click()
  document.body.removeChild(fakeLink)

  fakeLink.remove()
}

const exportChartWrapper = (chartId) => {
  const chartNumber = `chart${chartId}`
  const chartWrapper = document.getElementById(`${chartNumber}-wrapper`)
  exportAsImage("heavyai-chart-wrapper", () => chartWrapper, chartNumber)
}

if (getFeatureFlag(ENABLE_CHART_IMAGE_EXPORT)) {
  registerChartAddon({
    type: "CHART_ADDON_EXPORT_AS_IMAGE",
    label: "Export as Image",
    icon: <Icon icon="photo_camera" />,
    action: ({ chartId }) => exportChartWrapper(chartId),
    userHasPermission: (roles) => !isUserExportDisabled(roles)
  })
}
