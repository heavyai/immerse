// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { TextDecoder, TextEncoder } from "util"
import structuredClone from "@ungap/structured-clone"

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.structuredClone = structuredClone

global.fetch = jest
  .fn()
  .mockResolvedValue({ json: jest.fn().mockResolvedValue({}) })

global.URL.createObjectURL = () => {}

// Unit tests do not require actual canvas rendering
jest.mock("vega-canvas", () => ({ canvas: () => {} }))
