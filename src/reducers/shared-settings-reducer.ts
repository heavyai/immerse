// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  PaletteMapping,
  SharedSettingsState
} from "components/shared-settings/types"
import {
  ADD_PALETTE_MAPPING,
  UPDATE_PALETTE_MAPPING,
  DELETE_PALETTE_MAPPING,
  SET_PALETTE_MAPPING_NAME
} from "components/shared-settings/palette-mapping-actions"
import produce from "immer"
import pushid from "pushid"
import { AnyAction } from "redux"
import {
  isD3ChartWithCustomDomainRange,
  appendD3DomainRange
} from "reducers/charts/helpers/color-helpers"

const initialColorsState: SharedSettingsState = {
  mappings: []
}

export const sharedSettings = produce(
  (
    state = initialColorsState,
    action: AnyAction
    // eslint-disable-next-line consistent-return
  ): SharedSettingsState | void => {
    switch (action.type) {
      case ADD_PALETTE_MAPPING: {
        const { name, dataSource, column, mappingId } = action
        const id = mappingId ?? pushid()

        const newMapping = {
          id,
          name,
          dataSource,
          column,
          mapping: action.mapping
        }
        state.mappings.push(newMapping)
        break
      }
      case UPDATE_PALETTE_MAPPING: {
        const { id, mapping, chart } = action
        const foundMapping = state.mappings.find(
          (m: PaletteMapping) => m.id === id
        )
        if (foundMapping) {
          // if we have a D3 chart, we don't want to overwrite the mappings domain, but rather append to it
          // since D3 charts by default have a small topk and the other charts have much larger topk's
          let updatedDomain =
            mapping.customDomain ?? foundMapping.mapping.customDomain
          let updatedRange =
            mapping.customRange ?? foundMapping.mapping.customRange
          if (isD3ChartWithCustomDomainRange(chart)) {
            const { domain, range } = appendD3DomainRange(
              foundMapping.mapping.customDomain,
              foundMapping.mapping.customRange,
              mapping.customDomain,
              mapping.customRange
            )
            updatedDomain = domain
            updatedRange = range
          }

          foundMapping.mapping = {
            ...foundMapping.mapping,
            ...mapping,
            customDomain: updatedDomain,
            customRange: updatedRange
          }
        }
        break
      }
      case DELETE_PALETTE_MAPPING: {
        const { pmId } = action
        const idx = state.mappings.findIndex((m) => m.id === pmId)
        if (idx !== -1) {
          state.mappings.splice(idx, 1)
        }
        break
      }
      case SET_PALETTE_MAPPING_NAME: {
        const { id, name } = action
        const foundMapping = state.mappings.find(
          (m: PaletteMapping) => m.id === id
        )
        if (foundMapping) {
          foundMapping.name = name
        }
        break
      }
      default:
        return state
    }
  }
)
