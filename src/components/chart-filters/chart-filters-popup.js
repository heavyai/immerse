// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react"
import { MenuSurfaceAnchor, MenuSurface } from "@rmwc/menu"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import PropTypes from "prop-types"

import ChartFilters from "./chart-filters"

const ChartFiltersPopup = ({ chartId }) => {
  const [open, setOpen] = useState(false)

  return (
    <MenuSurfaceAnchor>
      <MenuSurface open={open} onClose={() => setOpen(false)}>
        <ChartFilters chartId={chartId} open={open} />
      </MenuSurface>

      <Tooltip content="View chart filters" enterDelay={300}>
        <div className={"chart-button"} onClick={() => setOpen(!open)}>
          <Icon icon="visibility" />
        </div>
      </Tooltip>
    </MenuSurfaceAnchor>
  )
}

ChartFiltersPopup.propTypes = {
  chartId: PropTypes.string.isRequired
}

export default ChartFiltersPopup
