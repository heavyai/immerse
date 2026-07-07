// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createBrowserHistory } from "history"

const history = createBrowserHistory({
  basename: window.IMMERSE_PATH_PREFIX || ""
})

export default history
