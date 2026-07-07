// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"

type Props = {
  name: string
  className?: string
  viewBox?: string
  testId?: string
  onClick?: () => void
}

const Icon: FC<Props> = ({
  name,
  className = "icon",
  viewBox = "0 0 48 48",
  testId = "icon",
  onClick = () => {}
}) => (
  <svg
    data-testid={testId}
    className={className}
    viewBox={viewBox}
    onClick={onClick}
  >
    <use xlinkHref={`#icon-${name}`} />
  </svg>
)

export default Icon
