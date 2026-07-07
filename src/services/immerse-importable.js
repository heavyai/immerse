// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// this exists to bust circular dependencies.
// if you're getting a circle on this:
//
// import Services from "services/immerse"
//
// do this instead:
//
// import {importableServices as Services } from "services/immerse-importable"
//
// yes, this is as dumb as it sounds.

export let importableServices = new Map()

export function populateImportableService(newMapDServices) {
  importableServices = newMapDServices
}
