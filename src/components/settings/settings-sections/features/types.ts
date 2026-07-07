// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type FeaturesGroup = {
  label: string
  value: string
  description: string
  icon: React.ReactNode
}

export type FlagDefinition = {
  key: string
  description: string
  default?: any
}
