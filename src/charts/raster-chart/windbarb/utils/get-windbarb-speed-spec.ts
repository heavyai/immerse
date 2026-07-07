// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const getWindbarbSpeedSpec = (measures) => {
  const speedMeasure = measures.find((m) => m.name === "speed")
  return {
    field: speedMeasure?.value,
    type: "quantitative",
    scale: null
  }
}
