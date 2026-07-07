// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from "react-redux"

export const useDashboardRefresh = () => {
  return useSelector((state) => state?.dashboard?.streaming?.last_request)
}
