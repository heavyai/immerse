// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import store from "store/store"

export const isHardwareDistributed = (): boolean => {
  const hardwareInfo = store.getState().connection.hardwareInfo
  return hardwareInfo && hardwareInfo.length > 1
}
