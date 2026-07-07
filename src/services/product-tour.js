// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function initializeProductTour() {
  if (document) {
    const walkme = document.createElement("script")
    walkme.type = "text/javascript"
    walkme.async = true
    walkme.src =
      "https://cdn.walkme.com/users/5b9e1e00dcfa41e08804974ed864792a/walkme_5b9e1e00dcfa41e08804974ed864792a_https.js"
    const s = document.getElementsByTagName("script")[0]
    s.parentNode.insertBefore(walkme, s)
    // eslint-disable-next-line no-underscore-dangle
    window._walkmeConfig = { smartLoad: true }
  }
}
