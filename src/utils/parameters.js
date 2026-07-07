// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { varExtractRegex } from "./ImmerseSQLPlusPlus/parser-tokens"

export const toParameterSyntax = (paramName) => {
  return `\${${paramName}}`
}

// returns true if a string has a ${.+} substring. i.e., contains our magic param syntax.
export const hasParamSyntax = (str = "") =>
  typeof str === "string" && Boolean(str.match(varExtractRegex))
