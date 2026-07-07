// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const getNumberChartData = (chart, data = {}) => {
  return data["groupAll/value:undefined"]?.[0]?.val
}

export default getNumberChartData
