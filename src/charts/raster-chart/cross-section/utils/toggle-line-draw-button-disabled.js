// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const toggleLineDrawButtonDisabled = (chartId, filters) => {
  const line = filters.find((f) => f.type === "LatLonPolyLine")
  const chartElement = document.getElementById(`chart${chartId}`)
  const lineDrawButton = chartElement?.getElementsByClassName(
    "heavyai-draw-button-CrossSection"
  )

  if (lineDrawButton) {
    Array.from(lineDrawButton).forEach((b) => {
      if (line) {
        b.setAttribute("disabled", "")
      } else {
        b.removeAttribute("disabled")
      }
    })
  }
}
