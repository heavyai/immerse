// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

export const IconThumbsUp = ({ className }: { className?: string }) => {
  return (
    <svg data-testid="icon" className={className} viewBox="0 0 24 24">
      <use xlinkHref="#icon-thumbs-up" />
    </svg>
  )
}
