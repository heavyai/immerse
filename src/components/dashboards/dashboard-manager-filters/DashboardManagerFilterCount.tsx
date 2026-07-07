// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type Props = {
  filteredListCount: number
  fullListCount: number
}

const DashboardManagerFilterCount: FC<Props> = ({
  filteredListCount,
  fullListCount
}) => {
  return (
    <div className="dashboard-mngr-filter-count">
      {filteredListCount}/{fullListCount}
    </div>
  )
}

export default DashboardManagerFilterCount
