// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Puppeteer 25 is ESM. Node 24 can require it synchronously; Jest's legacy
// module loader cannot. Keep browser automation outside Jest's module sandbox.
const { createRequire } = process.getBuiltinModule("module")
module.exports = createRequire(__filename)("puppeteer")
