// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TRIAL_URL } from "constants/hyperlinks"

export const setCustomTitle = (title: string) => {
  window.document.title = title
}

export const setCustomMetadata = (metadata: string) => {
  if (metadata && window.document) {
    const meta = window.document.createElement("meta")
    meta.content = metadata
    meta.name = "description"
    window.document.getElementsByTagName("head")[0].appendChild(meta)
  }
}

export const handleTryEnterpriseClick = () => {
  window.open(TRIAL_URL)
}
