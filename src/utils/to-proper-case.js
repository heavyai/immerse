// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export default function toProperCase(s) {
  return s.toLowerCase().replace(/^(.)|\s(.)/g, ($1) => $1.toUpperCase())
}
