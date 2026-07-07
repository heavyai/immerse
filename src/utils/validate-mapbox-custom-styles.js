// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// checks to see if custom basemap styles for Mapbox GL JS were specified in servers.json
// the mapboxCustomStyles property should be an array of plain objects with "label" and "value" properties
const validateMapboxCustomStyles = (config) => {
  const { mapboxCustomStyles } = config
  if (
    mapboxCustomStyles &&
    Array.isArray(mapboxCustomStyles) &&
    mapboxCustomStyles.length &&
    mapboxCustomStyles.every(
      (style) => typeof style === "object" && style.label
    )
  ) {
    return mapboxCustomStyles
  }
  return []
}

export default validateMapboxCustomStyles
