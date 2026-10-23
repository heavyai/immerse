// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { setDefaultOptions } from "expect-puppeteer"

const testOperationTimeout = 60000
const testExecutionTimeout = process.env.DEBUG === "true" ? 120000 : 60000

setDefaultOptions({ timeout: testOperationTimeout })

jest.setTimeout(testExecutionTimeout)
