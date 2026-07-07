// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const MINMAX_TOKEN = "minMax"
export const CARDINALITY_TOKEN = "cardinality"
export const MINMAX_SQL_TOKEN = "getMinMaxSQL"
export const RASTER_STRIDE_TOKEN = "getRasterStride"

export const shouldTrackUsage = ({ token, trackUsage }) => {
  // if we explicitly said we want to track usage, then believe it and do so
  if (trackUsage !== undefined) {
    return trackUsage
  }

  // otherwise, these are tokens we know we don't want to track, so ignore them.
  if (
    token.includes(MINMAX_TOKEN) ||
    token.includes(CARDINALITY_TOKEN) ||
    token.includes(MINMAX_SQL_TOKEN)
  ) {
    return false
  }

  // and finally, assume that we do indeed want to track, which is the default.
  return true
}
