// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createRoot } from "react-dom/client"

export function mountApplication(container, application) {
  const root = createRoot(container)
  root.render(application)
  return () => root.unmount()
}
