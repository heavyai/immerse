// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Replace w/ logic for generating tablename from import connector source
import { TABLE_PREVIEW_DATA } from "../constants"

export const generateNewTableName = () =>
  `new-table-name-${Object.keys(TABLE_PREVIEW_DATA).length + 1}`
