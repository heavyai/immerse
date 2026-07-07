// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppState } from "vega/charts/types"
import { getLayerById } from "vega/utils/data-selection"
import { CHART_TYPES } from "constants/chart-types"
import { PaletteMapping } from "../types"
import { APPLY_SAVED_PALETTE_MAPPING } from "constants/action-types"
import { ChartState } from "reducers/charts/charts-reducer-types"
import {
  clearPaletteMapping,
  saveAndSetPaletteMapping,
  setLastPaletteMappingId,
  clearLastPaletteMappingId,
  updatePaletteMapping,
  deletePaletteMapping
} from "../palette-mapping-thunks"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"
import {
  isD3ChartWithCustomDomainRange,
  setD3MappingDomainRange,
  categoricalColorFromChart
} from "reducers/charts/helpers/color-helpers"
import { Button } from "@rmwc/button"
import { IconCustomize } from "components/svg-icons/icon-customize"
import { MenuSurfaceAnchor } from "@rmwc/menu"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { clearImportDashboardId } from "actions/shared-settings-import-action-creators"
import { useImportPaletteMapping } from "../import/use-import-palette-mapping"
import { PaletteMappingItemMenu } from "./palette-mapping-item-menu"
import { PaletteMappingCustomizeMenu } from "./palette-mapping-customize-menu"
import { PaletteMappingNameModal } from "./palette-mapping-name-modal"
import { PaletteMappingDeleteModal } from "./palette-mapping-delete-modal"
import { useLastPaletteMappingId } from "../hooks/use-last-palette-mapping-id"
import {
  PaletteMappingWarningModal,
  WARNING_ACTIONS
} from "./palette-mapping-warning-modal"
import { useDeferredPromise } from "../hooks/use-deferred-promise"

import "./palette-mapping-selector.scss"

const { COLOR } = SELECTOR_ASSIGNMENTS
interface IPaletteMappingSelectorProps {
  chartId: string
  chart: ChartState
  layerId: string
  isMeasure: boolean
}

export const PaletteMappingSelector = ({
  chartId,
  chart,
  layerId,
  isMeasure = false
}: IPaletteMappingSelectorProps) => {
  const dispatch = useDispatch()
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const paletteMappings = useSelector(
    (state: AppState) => state.sharedSettings.mappings
  )
  const [nameModalOpen, setNameModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const colorMeasure = chart.measures.find((m) => m.name === COLOR)
  const isComboOrBoxPlotChart = [
    CHART_TYPES.VEGA_COMBO,
    CHART_TYPES.BOX_PLOT
  ].includes(chart.type)
  const lastPaletteMappingId = useLastPaletteMappingId(
    chart,
    layerId,
    isMeasure
  )
  const getSelectedPaletteMappingId = () => {
    const layer = getLayerById(chart.dataSelections, layerId)
    if (isMeasure) {
      return layer?.measures?.color?.paletteMappingId
    } else if (layer?.dimensions?.color?.paletteMappingId) {
      return layer?.dimensions?.color?.paletteMappingId
    } else {
      return layer.paletteMappingId
    }
  }
  const selectedPaletteMappingId = isComboOrBoxPlotChart
    ? getSelectedPaletteMappingId()
    : chart.color.paletteMappingId

  const handleMappingSelect = (pm: PaletteMapping) => {
    dispatch(setLastPaletteMappingId(chartId, layerId, pm.id, isMeasure))
    dispatch({
      type: APPLY_SAVED_PALETTE_MAPPING,
      chartId,
      layerId,
      paletteMapping: pm,
      isMeasure
    })

    if (isD3ChartWithCustomDomainRange(chart)) {
      setD3MappingDomainRange({
        chart,
        mapping: pm.mapping
      })
    }
  }
  const isDirty = Boolean(!selectedPaletteMappingId && lastPaletteMappingId)

  const getChartColor = () => {
    const selectedPaletteMapping = paletteMappings.find(
      (m) => m.id === selectedPaletteMappingId
    )
    // Combo Adapter - dynamic values -> color definition for mapping
    return categoricalColorFromChart(
      chart,
      selectedPaletteMapping,
      layerId,
      isMeasure
    )
  }

  /**
   * Handles updates synchronously, this is needed to handle unsaved changes
   * and immediately switching palette mappings after those changes have been made
   */
  const handleUpdateSync = async () => {
    const color = getChartColor()
    await dispatch(
      updatePaletteMapping({
        chartId,
        layerId,
        pmId: lastPaletteMappingId,
        color,
        isMeasure
      })
    )

    await dispatch(
      setLastPaletteMappingId(chartId, layerId, lastPaletteMappingId, isMeasure)
    )
  }

  const handleUpdate = () => {
    const color = getChartColor()
    dispatch(
      updatePaletteMapping({
        chartId,
        layerId,
        pmId: lastPaletteMappingId,
        color,
        isMeasure
      })
    )

    dispatch(
      setLastPaletteMappingId(chartId, layerId, lastPaletteMappingId, isMeasure)
    )
  }

  const handleSaveAs = () => {
    setNameModalOpen(true)
  }

  // Reset chart palette mappings to last applied mapping
  const resetUnsavedChanges = () => {
    const originalMapping = paletteMappings.find(
      (pm) => pm.id === lastPaletteMappingId
    )
    if (originalMapping) {
      handleMappingSelect(originalMapping)
    }
  }

  const handleSaveAsNew = async (name: string) => {
    setNameModalOpen(false)
    let dataSource = chart.dataSource
    let column = colorMeasure?.value ?? chart?.dimensions[0]?.value
    if ([CHART_TYPES.VEGA_COMBO, CHART_TYPES.BOX_PLOT].includes(chart.type)) {
      const layer = getLayerById(chart.dataSelections, layerId)
      dataSource = layer?.table?.name
      column =
        layer?.measures?.color?.column?.value ??
        layer?.dimensions?.color?.column?.value ??
        layer?.dimensions?.xAxis?.[0].column?.value
    }
    const paletteMapping = paletteMappings.find(
      (pm) => pm.id === selectedPaletteMappingId
    )?.mapping
    await dispatch(
      saveAndSetPaletteMapping({
        chartId,
        layerId,
        mapping: paletteMapping ?? getChartColor(),
        dataSource,
        column,
        name,
        isMeasure
      })
    )
  }

  const handleDelete = () => {
    setDeleteModalOpen(true)
  }

  const deleteMapping = () => {
    setDeleteModalOpen(false)
    dispatch(deletePaletteMapping({ pmId: selectedPaletteMappingId }))
    dispatch(clearLastPaletteMappingId(chartId, layerId, isMeasure))
  }

  const handleClear = () => {
    dispatch(
      clearPaletteMapping({
        chartId,
        layerId,
        isMeasure,
        pmId: selectedPaletteMappingId
      })
    )
    dispatch(clearLastPaletteMappingId(chartId, layerId, isMeasure))
  }
  const selectedMapping = paletteMappings.find(
    (pm) => pm.id === selectedPaletteMappingId
  )
  const lastSelectedMapping = paletteMappings.find(
    (pm) => pm.id === lastPaletteMappingId
  )

  const getSelectorDataSource = () => {
    if (isComboOrBoxPlotChart) {
      const layer = getLayerById(chart.dataSelections, layerId)
      if (isMeasure) {
        return layer?.measures?.color?.table
      } else if (layer?.dimensions?.color) {
        return layer?.dimensions?.color?.table
      } else {
        return layer?.dimensions?.xAxis[0]?.table
      }
    } else {
      return chart.dataSource
    }
  }

  const getSelectorTableAndColumn = () => {
    if (isComboOrBoxPlotChart) {
      const layer = getLayerById(chart.dataSelections, layerId)
      if (isMeasure) {
        const selector = layer?.measures?.color?.column
        return [selector.table, selector.value]
      } else if (layer?.dimensions?.color) {
        if (layer?.dimensions?.color?.type === "custom_sql") {
          // May not have a displayable value for custom SQL columns, leaving this undefined.
          return [layer?.dimensions?.color?.table]
        }
        const selector = layer?.dimensions?.color?.column
        return [selector?.table, selector?.value]
      } else {
        const selector = layer?.dimensions?.xAxis[0]?.column
        return [selector?.table, selector?.value]
      }
    } else if (isD3ChartWithCustomDomainRange(chart)) {
      return [chart.dimensions[0].table, chart.dimensions[0].value]
    } else {
      return [colorMeasure?.table, colorMeasure?.value]
    }
  }
  const [table, column] = getSelectorTableAndColumn()

  const { importMapping, setImportMapping, doImport } = useImportPaletteMapping(
    handleMappingSelect
  )
  const [warningModalOpen, setWarningModalOpen] = useState(false)

  const { defer, deferRef } = useDeferredPromise<WarningAction>()

  const confirmWithModal = async () => {
    setWarningModalOpen(true)
    return defer().promise
  }

  return (
    <div className="palette-mapping-selector">
      <div className="palette-mapping-selector__section">
        <div className="palette-mapping-selector__row">
          <span>Color Mapping</span>

          <div className="palette-mapping-selector__row__section">
            <Tooltip content="Create New">
              <Button outlined className="dense" onClick={handleSaveAs}>
                <div className="customize-mapping-button">
                  <Icon icon={{ icon: "add", size: "small" }} />
                </div>
              </Button>
            </Tooltip>
            <MenuSurfaceAnchor>
              <PaletteMappingCustomizeMenu
                isDirty={isDirty}
                table={table}
                dataSource={getSelectorDataSource()}
                column={column}
                open={customizeOpen}
                modalResponse={confirmWithModal}
                saveCurrentMapping={async () => {
                  await handleUpdateSync()
                }}
                onSelect={(paletteMapping) => {
                  handleMappingSelect(paletteMapping)
                  setCustomizeOpen(false)
                }}
                onClose={() => {
                  setCustomizeOpen(false)
                  dispatch(clearImportDashboardId())
                }}
                setImportMapping={(m) => {
                  setImportMapping(m)
                  setCustomizeOpen(false)
                }}
              />

              <Button
                className="dense"
                outlined
                onClick={() => setCustomizeOpen(true)}
              >
                <div className="customize-mapping-button">
                  <IconCustomize fill="black" />
                  <div>Manage</div>
                </div>
              </Button>
            </MenuSurfaceAnchor>
          </div>
        </div>
        {(selectedMapping || lastSelectedMapping) && (
          <div className="palette-mapping-selector__row">
            <PaletteMappingItemMenu
              paletteMapping={selectedMapping ?? lastSelectedMapping}
              isDirty={isDirty}
              onClear={handleClear}
              onSave={handleUpdate}
              onSaveAs={handleSaveAs}
              onDelete={handleDelete}
              onReset={resetUnsavedChanges}
            />
          </div>
        )}
        {importMapping && (
          <PaletteMappingNameModal
            open
            onClose={() => {
              setImportMapping(undefined)
            }}
            onConfirm={doImport}
            defaultName={`${importMapping.name} (copy)`}
            title="Import Mapping"
            createLabel="Import"
            showInfoBox
            infoBoxContent={
              <p>
                Importing a previously created mapping from another dashboard
                into your current dashboard.
              </p>
            }
          />
        )}
        {nameModalOpen && (
          <PaletteMappingNameModal
            open
            onClose={() => setNameModalOpen(false)}
            onConfirm={handleSaveAsNew}
          />
        )}
        {deleteModalOpen && (
          <PaletteMappingDeleteModal
            open={deleteModalOpen}
            mapping={selectedMapping ?? lastSelectedMapping}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={deleteMapping}
          />
        )}
        {warningModalOpen && (
          <PaletteMappingWarningModal
            open
            description="Save out your changes and update the chart or go back to the chart editor to make adjustments."
            onCancel={() => {
              setWarningModalOpen(false)
              deferRef?.resolve(WARNING_ACTIONS.CANCEL)
            }}
            onDiscard={() => {
              setWarningModalOpen(false)
              deferRef?.resolve(WARNING_ACTIONS.DISCARD)
            }}
            onSave={() => {
              setWarningModalOpen(false)
              deferRef?.resolve(WARNING_ACTIONS.SAVE)
            }}
          />
        )}
      </div>
    </div>
  )
}
