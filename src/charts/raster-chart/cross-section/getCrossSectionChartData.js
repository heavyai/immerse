// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getCrossSectionChartData = (chart, data = {}) => {
  const { image, vega_metadata } = data?.renderVegaAsync
  return { image, vega_metadata }
}

export default getCrossSectionChartData
