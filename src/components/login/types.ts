// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface User {
  database: string
  host: string
  master: boolean
  password: string
  port: number | string
  protocol: string
  url: string
  username: string
}
