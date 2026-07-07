// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const tabDisplayName = ({ tabName: userSetName, defaultTabIndex }) => {
  return (
    userSetName ||
    (typeof defaultTabIndex === "number"
      ? `Page ${defaultTabIndex + 1}`
      : "Page")
  )
}
