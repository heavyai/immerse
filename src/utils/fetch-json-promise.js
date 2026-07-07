// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import urljoin from "url-join"

// Use this for same-origin requests. Adds a prefix to the URL based on the
// value set in `app-config.js`.
export function fetchJsonPromiseSameOrigin(url) {
  const prefix = window.IMMERSE_PATH_PREFIX || ""

  return fetch(urljoin("/", prefix, url), {
    credentials: "same-origin"
  }).then((r) => r.json())
}

// Use this for cross-origin requests. URL will not be prefixed.
export function fetchJsonPromiseCrossOrigin(url) {
  return fetch(url).then((r) => r.json())
}
