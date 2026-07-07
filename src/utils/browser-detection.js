// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function isIE11() {
  return !window.ActiveXObject && "ActiveXObject" in window
}
