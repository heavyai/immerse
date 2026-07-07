// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  UNITS,
  FEET_TO_METERS_RATIO,
  SEA_LEVEL_PRESSURE_MB,
  STANDARD_ALTITUDE
} from "constants/units"

export function metersToFeet(m: number): number {
  return m / FEET_TO_METERS_RATIO
}
export function feetToMeters(ft: number): number {
  return ft * FEET_TO_METERS_RATIO
}

export function millibarsToLinearUnit(
  altitudeMb: number,
  targetUnit: UNITS = UNITS.FEET
) {
  // Using NOAA function https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
  // Matching most all real world examples of the scales showing mb and ft
  const altitudeFt =
    (1 - (altitudeMb / SEA_LEVEL_PRESSURE_MB) ** 0.190284) * STANDARD_ALTITUDE

  switch (targetUnit) {
    case UNITS.FEET:
      return altitudeFt
    case UNITS.METERS:
      return feetToMeters(altitudeFt)
    default:
      return altitudeFt
  }
}

export function linearUnitToMillibars(
  altitude: number,
  linearUnit = UNITS.FEET
) {
  let altitudeInFeet = altitude

  if (linearUnit === UNITS.METERS) {
    altitudeInFeet = metersToFeet(altitudeInFeet)
  }
  // Flipped NOAA function, needs altitude in ft
  const altitudeMb =
    SEA_LEVEL_PRESSURE_MB *
    (1 - altitudeInFeet / STANDARD_ALTITUDE) ** (1 / 0.190284)

  return altitudeMb
}

/**
 * "Universal" conversion method to go between any units in our UNITS constant
 *
 * @param value - The value to convert
 * @param originUnit - What unit is the value in
 * @param destUnit - What is the output unit of this conversion
 * @returns Takes value and converts from origin unit to dest unit
 */
export function convertValue(
  value: number,
  originUnit: UNITS,
  destUnit: UNITS
): number {
  const conversionMap = {
    [UNITS.FEET]: {
      [UNITS.METERS]: feetToMeters,
      [UNITS.FEET]: (ft: number) => ft,
      [UNITS.MILLIBARS]: (ft: number) => linearUnitToMillibars(ft, UNITS.FEET)
    },
    [UNITS.METERS]: {
      [UNITS.METERS]: (m: number) => m,
      [UNITS.FEET]: metersToFeet,
      [UNITS.MILLIBARS]: (m: number) => linearUnitToMillibars(m, UNITS.METERS)
    },
    [UNITS.MILLIBARS]: {
      [UNITS.METERS]: (mb: number) => millibarsToLinearUnit(mb, UNITS.METERS),
      [UNITS.FEET]: (mb: number) => millibarsToLinearUnit(mb, UNITS.FEET),
      [UNITS.MILLIBARS]: (mb: number) => mb
    }
  }

  return conversionMap[originUnit][destUnit](value)
}
