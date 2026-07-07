// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from "react"
import { VegaLite, VisualizationSpec } from "react-vega"

import "./sql-notebook-visualization-view.scss"
import {
  isThemeDarkOrCustom,
  useImmerseUITheme
} from "utils/theme/use-immerse-ui-theme"

interface ISqlNotebookVisualizationView {
  vegaSpec: VisualizationSpec
  vegaData: any
}

export const SqlNotebookVisualizationView: FC<ISqlNotebookVisualizationView> = ({
  vegaSpec,
  vegaData
}) => {
  const { theme } = useImmerseUITheme()
  const formattedVegaData = useMemo(() => {
    return { table: vegaData }
  }, [vegaData])

  return (
    <div className="visualization-view-container">
      <div className="visualization-view">
        {vegaSpec && (
          <VegaLite
            spec={vegaSpec}
            data={formattedVegaData}
            actions={false}
            theme={isThemeDarkOrCustom(theme) ? "dark" : "default"}
          />
        )}
      </div>
    </div>
  )
}
