// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import html2canvas from "html2canvas"

export const getChartImageUrl = async (
  id,
  selector = (elementId) => document.getElementById(elementId)
) => {
  const canvas = await html2canvas(selector(id))

  return canvas.toDataURL("image/png", 1.0)
}
