// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeAppConfig } from "utils/app-config"

// Zero-index captured here for Immerse parity:
// https://github.com/heavyai/immerse/commit/140443b3794904b49cd02feb773044038e57aaf4#diff-3990cca5189228ea57dcb4bb44a60b21R54
export default normalizeAppConfig(window.APP_CONFIG && window.APP_CONFIG[0])
