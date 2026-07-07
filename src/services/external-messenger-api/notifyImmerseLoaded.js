// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import isIFramed from "utils/isIFramed"
import { isValidOrigin } from "./usingExternalListeners"
import { setImmerseIsLoaded } from "./api/isImmerseLoaded"

const notifyImmerseLoaded = () => {
  setImmerseIsLoaded(true)
  try {
    const parentOrigin = new URL(document.referrer).origin
    if (isIFramed() && isValidOrigin(parentOrigin)) {
      window.parent.postMessage(
        {
          type: "immerseLoaded",
          payload: { immerseLoaded: true }
        },
        parentOrigin
      )
    }
  } catch (e) {
    // swallow it. If we're failing here, it's because document.referrer doesn't exist.
  }
}

export default notifyImmerseLoaded
