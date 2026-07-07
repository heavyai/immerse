// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const METERS_PER_DECIMAL_DEGREE = 111319
export const EARTH_CIRCUMFERENCE = 40075017

// This is a 'dumb' implementation, it gives you the approximate meters at the equator
export function decimalDegreesToMeters(ddDistance) {
  return ddDistance * METERS_PER_DECIMAL_DEGREE
}

export const metersPerPixelAtZoom = (latitude, zoomLevel) => {
  if (
    latitude === null ||
    latitude === undefined ||
    zoomLevel === null ||
    zoomLevel === undefined
  ) {
    return null
  }

  if (latitude > 90 || latitude < -90) {
    throw new Error(
      `Invalid latitude provided: ${latitude}, must be between 90 and -90`
    )
  }
  if (zoomLevel > 22 || zoomLevel < 0) {
    throw new Error(
      `Invalid zoom level provided: ${zoomLevel}, must be between 0 and 22`
    )
  }
  const latitudeRadians = latitude * (Math.PI / 180)
  return (
    (EARTH_CIRCUMFERENCE * Math.cos(latitudeRadians)) /
    Math.pow(2, zoomLevel + 9)
  )
}
