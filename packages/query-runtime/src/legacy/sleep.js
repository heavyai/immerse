// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// utility function. Just sleep for the given number of ms.

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
