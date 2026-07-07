// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export enum SCALE_TYPES {
  LINEAR = "linear",
  LOG = "log"
}

export type ScaleType = SCALE_TYPES.LINEAR | SCALE_TYPES.LOG
