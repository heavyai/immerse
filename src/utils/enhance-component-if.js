// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export default function enhanceComponentIf(hoc, condition) {
  return (BaseComponent) => (condition ? hoc(BaseComponent) : BaseComponent)
}
