// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react"
import { useCharts } from "charts/utils/hooks/useCharts"
import { useTabs } from "charts/utils/hooks/useTabs"
import { useCurrentTabId } from "charts/utils/hooks/useCurrentTabId"
import { SimpleDangerDialog } from "widgets/dialog/Dialog"
import WarningIcon from "components/svg-icons/icon-warning"
import { PaletteMapping } from "../types"
import { CHART_TYPES } from "constants/charts"

import "./palette-mapping-delete-modal.scss"

export const PaletteMappingDeleteModal = ({
  open,
  mapping,
  onClose,
  onConfirm
}: {
  open: boolean
  mapping: PaletteMapping
  onClose: () => void
  onConfirm: () => void
}) => {
  const charts = useCharts()
  const tabs = useTabs()
  const currentTab = useCurrentTabId()

  const { numChartsUsingMapping, numTabsUsingMapping } = useMemo(() => {
    let chartCount = 0
    let tabCount = 0

    const checkMappingInCharts = (chartCollection) => {
      let hasMappingInTab = false
      Object.values(chartCollection).forEach((chart) => {
        if (
          [CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)
        ) {
          for (const ds of chart.dataSelections) {
            if (
              ds?.dimensions?.color?.paletteMappingId === mapping.id ||
              ds?.measures?.color?.paletteMappingId === mapping.id ||
              ds?.paletteMappingId === mapping.id
            ) {
              chartCount++
              hasMappingInTab = true
              break
            }
          }
        } else if (chart?.layers) {
          for (const layer of chart.layers) {
            if (layer?.color?.paletteMappingId === mapping.id) {
              chartCount++
              hasMappingInTab = true
              break
            }
          }
        } else if (chart?.color?.paletteMappingId === mapping.id) {
          chartCount++
          hasMappingInTab = true
        }
      })
      return hasMappingInTab
    }

    // Count charts in current tab
    if (mapping && checkMappingInCharts(charts)) {
      tabCount++
    }

    // If there are other tabs, check each tab except the current one
    if (tabs && Object.keys(tabs).length > 1) {
      Object.entries(tabs).forEach(([tabId, tab]) => {
        if (tabId !== currentTab && tab?.charts) {
          if (checkMappingInCharts(tab.charts)) {
            tabCount++
          }
        }
      })
    }

    return { numChartsUsingMapping: chartCount, numTabsUsingMapping: tabCount }
  }, [charts, tabs, currentTab, mapping])

  return (
    <SimpleDangerDialog
      open={open}
      title={
        <div className="palette-mapping-delete-modal__header">
          <WarningIcon />
          <div className="palette-mapping-delete-modal__header-text">
            Delete Mapping
          </div>
        </div>
      }
      hideCloseIcon
      primaryLabel={"Delete"}
      secondaryLabel={"Go Back"}
      primaryAction={onConfirm}
      secondaryAction={onClose}
      className={"palette-mapping-delete-modal app-overlay"}
    >
      <div className="palette-mapping-delete-modal__body">
        <div className="palette-mapping-delete-modal__warning-title">
          You are about to delete the color mapping:{" "}
          <span className="palette-mapping-delete-modal__mapping-name">
            {mapping?.name ?? ""}
          </span>
        </div>
        This mapping is being used in
        <strong>
          {` ${numChartsUsingMapping} `}
          {numChartsUsingMapping === 1 ? "chart " : "charts "}
        </strong>
        across your dashboard
        {numTabsUsingMapping > 1 && (
          <>
            {" and across "}
            <strong>{`${numTabsUsingMapping} tabs`}</strong>
          </>
        )}
        . Deleting this mapping will remove the associated mappings from these
        charts and may impact color consistency across your dashboard
        {numTabsUsingMapping > 1 ? " and tabs" : ""}.
        <p>Are you sure you want to proceed?</p>
      </div>
    </SimpleDangerDialog>
  )
}
