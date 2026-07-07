// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

interface SourceItemInterface {
  mdsi: number
  dataSourceName: string
  children: React.ReactElement
}

const SourceListItem: React.FC<SourceItemInterface> = ({
  dataSourceName,
  children,
  mdsi
}) => (
  <li className="px-2 pt-1 pb-2">
    <span>{`S${mdsi + 1} - ${dataSourceName}`}</span>
    {children}
  </li>
)

export default SourceListItem
