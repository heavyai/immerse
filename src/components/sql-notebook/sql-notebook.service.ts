// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import APP_CONFIG from "constants/app-config"
import { BASE_FETCH_CONFIG, HTTP_METHOD_GET } from "constants/services"

// Services for setting table and column comment metadata
export const checkIQAvailable = async (): Promise<boolean> => {
  return fetch(`${APP_CONFIG.url}/version.txt`, {
    ...(BASE_FETCH_CONFIG as { credentials: "include" }),
    ...{
      method: HTTP_METHOD_GET
    }
  }).then((resp: Response) => {
    if (resp.ok) {
      return resp.text().then((t) => {
        return t.includes("HeavyIQ")
      })
    } else {
      return false
    }
  })
}
