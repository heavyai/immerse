// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

const useChartsCount = () =>
  useSelector(({ charts }) => {
    return Object.keys(charts).filter((i) => !isNaN(i)).length
  })

export default useChartsCount
