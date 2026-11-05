// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeDashboard } from "@immerse/dashboard-document"

export const deserialize = (wire) => decodeDashboard(wire, window)
