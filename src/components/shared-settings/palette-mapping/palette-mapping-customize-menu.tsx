// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { Menu } from "@rmwc/menu"
import { useSelector } from "react-redux"
import cx from "classnames"

import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"
import { AppState } from "vega/charts/types"
import { useSharedSettings } from "hooks/useSharedSettings"
import { ButtonTabs } from "components/button-tabs/button-tabs"
import { PaletteMapping } from "../types"
import { CollapsiblePaletteMappingList } from "./collapsible-palette-mapping-list"
import { PaletteMappingImport } from "../import/palette-mapping-import"
import { PaletteMappingImportHeader } from "./palette-mapping-import-header"
import { groupPaletteMappings } from "../util/group-palette-mappings"
import { WARNING_ACTIONS, WarningAction } from "./palette-mapping-warning-modal"
import "./palette-mapping-customize-menu.scss"

const CUSTOMIZE_TABS = {
  CURRENT: "current",
  IMPORT: "import"
}

const TABS_CONFIG = [
  {
    label: "Current Dashboard",
    value: CUSTOMIZE_TABS.CURRENT,
    show: () => true
  },
  {
    label: "Import",
    value: CUSTOMIZE_TABS.IMPORT,
    show: () => true
  }
]

export const PaletteMappingCustomizeMenu = ({
  open,
  onSelect,
  onClose,
  table,
  dataSource,
  column,
  setImportMapping,
  modalResponse,
  saveCurrentMapping,
  isDirty = false
}: {
  open: boolean
  onSelect: (pm: PaletteMapping) => void
  onClose: () => void
  table: string
  dataSource?: string
  column: string
  setImportMapping: (m: PaletteMapping) => void
  modalResponse: () => Promise<WarningAction>
  saveCurrentMapping: () => void
  isDirty: boolean
}) => {
  const sharedSettings = useSharedSettings()
  const { mappings: paletteMappings } = sharedSettings
  const [activeTab, setActiveTab] = useState(CUSTOMIZE_TABS.CURRENT)
  const importDashboardId = useSelector(
    (state: AppState) => state.sharedSettingsImport.selectedDashboardId
  )

  const joinSource = useJoinFromParameter(dataSource)
  const dataSourceTitle = joinSource?.name || dataSource

  const { priorityMappings, otherMappings } = groupPaletteMappings({
    paletteMappings,
    table,
    column,
    dataSource
  })

  useEffect(() => {
    setActiveTab(CUSTOMIZE_TABS.CURRENT)
  }, [open])

  const handleSelect = async (pm: PaletteMapping) => {
    if (isDirty) {
      // Awaits a response from the modal
      const modalAction = await modalResponse()
      if (modalAction === WARNING_ACTIONS.SAVE) {
        await saveCurrentMapping()
        onSelect(pm)
      } else if (modalAction === WARNING_ACTIONS.DISCARD) {
        onSelect(pm)
      }
    } else {
      onSelect(pm)
    }
  }

  const handleImport = async (pm: PaletteMapping) => {
    if (isDirty) {
      // Awaits a response from the modal
      const modalAction = await modalResponse()
      if (modalAction === WARNING_ACTIONS.SAVE) {
        await saveCurrentMapping()
        setImportMapping(pm)
      } else if (modalAction === WARNING_ACTIONS.DISCARD) {
        setImportMapping(pm)
      }
    } else {
      setImportMapping(pm)
    }
  }

  return (
    open && (
      <Menu
        className="palette-mapping-customize-menu"
        open={open}
        onClose={onClose}
        hoistToBody
      >
        <div className="palette-mapping-customize-menu__container">
          <header
            className={cx(
              "palette-mapping-customize-menu__header",
              "palette-mapping-customize-menu__header--import"
            )}
          >
            {importDashboardId ? (
              <PaletteMappingImportHeader dashboardId={importDashboardId} />
            ) : (
              <ButtonTabs
                dense
                tabs={TABS_CONFIG}
                onActiveTabChange={setActiveTab}
                activeTab={activeTab}
              />
            )}
          </header>

          {activeTab === CUSTOMIZE_TABS.CURRENT && (
            <section>
              <CollapsiblePaletteMappingList
                onSelect={handleSelect}
                title={
                  table && column
                    ? `${dataSourceTitle} • ${column}`
                    : "Palette Mappings"
                }
                paletteMappings={priorityMappings}
              />

              {Boolean(otherMappings?.length) && (
                <CollapsiblePaletteMappingList
                  paletteMappings={otherMappings}
                  onSelect={handleSelect}
                  title={"Other Mappings"}
                  showSourceAndCol
                />
              )}
            </section>
          )}
          {activeTab === CUSTOMIZE_TABS.IMPORT && (
            <PaletteMappingImport
              setImportMapping={handleImport}
              table={table}
              column={column}
            />
          )}
        </div>
      </Menu>
    )
  )
}
