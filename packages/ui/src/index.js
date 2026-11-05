// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const base = require("./primitives")
const forms = require("./form-controls")
const primitives = { ...base, ...forms }
module.exports = { ...primitives, default: primitives }
Object.defineProperty(module.exports, "__esModule", { value: true })
