// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const getWindbarbDirectionFromPointmapOrientation = (
  pointmapOrientationSpec
) => {
  const { domain, range, ...rest } = pointmapOrientationSpec
  return {
    ...rest,
    scale: {
      domain,
      range
    }
  }
}
