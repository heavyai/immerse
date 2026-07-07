// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const QUERY_LIMIT = 5000

// Used to limit the number of geometries rendered on a map by heavy
export const POINT_RENDER_LIMIT = 50000000 // 50M
export const POINT_RENDER_LIMIT_DEFAULT = 10000000 // 10M

export const POLYGON_RENDER_LIMIT = 10000000 // 10M
export const POLYGON_RENDER_LIMIT_DEFAULT = 150000 // 150K

export const LINE_RENDER_LIMIT = 10000000 // 10M
export const LINE_RENDER_LIMIT_DEFAULT = 1000000 // 1M

export const MAX_SNIPPET_CHARACTER_LENGTH = 1000

// Max columns x rows for showing analysis tab when fastforwarding, as
// BE limits analysis to a certain number of results
export const ANALYSIS_RESULT_LIMIT = 20
