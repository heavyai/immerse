// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// this exists to bust circular dependencies.
// if you're getting a circle on this:
//
// import {process} from "utils/ImmerseSQLPlusPlus/parser"
//
// do this instead:
//
// import {importableProcess as process } from "utils/ImmerseSQLPlusPlus/parser-importable"
//
// yes, this is as dumb as it sounds.

export let importableProcess = () => {}

export function populateImportableProcess(newImportableProcess) {
  importableProcess = newImportableProcess
}
