// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export default (text, cutoff = 1000) =>
  text.length > cutoff ? `${text.substring(0, cutoff)}…` : text
