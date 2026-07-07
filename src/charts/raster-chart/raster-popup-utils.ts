// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Dimension, Measure, PopupColumnType } from "../../constants/prop-types"
import { process } from "utils/ImmerseSQLPlusPlus/parser"
import { importableStore as store } from "store/importableStore"
import { noteParameterUsage } from "components/parameters/actions"
import { SELECTOR_ASSIGNMENTS } from "constants/selectors"

function getLinemapMeasure(m: Dimension | Measure) {
  let measureName = null
  if (m.name === "color") {
    measureName = "strokeColor"
  } else if (m.name === "size") {
    measureName = "strokeWidth"
  } else {
    measureName = m.name
  }
  return measureName
}

export function reduceAggAndAliasMapPopupColumns(
  type: string,
  hoverSelectedColumns: PopupColumnType[],
  dimensions: Dimension[],
  measures: Measure[],
  grouped: boolean,
  chartId: string
): [string[], Record<string, string>] {
  const columns: string[] = []
  const aliases: Record<string, string> = {}
  let paramsInPopupColumns: string[] = []

  hoverSelectedColumns.forEach((hsc, i) => {
    const label =
      hsc.label &&
      process(hsc.label, {
        useDisplayName: true,
        onProcessComplete: ({ parametersInUse }) => {
          paramsInPopupColumns = paramsInPopupColumns.concat(
            Array.from(parametersInUse)
          )
        }
      })
    const dimIdx = dimensions.findIndex(
      (dim) => dim.value === hsc.value && dim.name === hsc.name
    )
    if (dimIdx > -1) {
      // dimensions are in hoverSelectedColumns
      if (grouped) {
        columns[i] = `key${dimIdx}`
        aliases[columns[i]] = label
      } else {
        columns[i] = label
      }
    } else if (
      measures.find((m) => m.value === hsc.value && m.name === hsc.name)
    ) {
      // measures are in hoverSelected columns
      columns[i] = type === "linemap" ? getLinemapMeasure(hsc) : hsc.name
      if (hsc.type === "STR" && hsc.name === SELECTOR_ASSIGNMENTS.COLOR) {
        columns[i] = "color_attr"
      }
      if (grouped) {
        aliases[columns[i]] =
          hsc.label === "# Records" || hsc.aggType === "Custom" || hsc.custom
            ? label
            : `${hsc.aggType.toUpperCase()}(${label})`
      } else {
        aliases[columns[i]] = label
      }
    } else {
      columns[i] = label
    }
  })

  // Columns chosen for the popup don't always appear in the query for the chart,
  // which is the bulk of where we track param usage. This creates a new token
  // for the columns that appear in raster popups.
  //
  // We are calling `noteParameterUsage` manually here rather than letting the `process`
  // in the `hoverSelectedColumns` loop above because if a user adds a param popup column
  // and then removes it from `hoverSelectedColumns`, we won't know to remove the associated usage
  store.dispatch(
    noteParameterUsage({
      token: "rasterHoverSelectedColumns",
      chartId,
      parameters: paramsInPopupColumns
    })
  )

  return [columns, aliases]
}
