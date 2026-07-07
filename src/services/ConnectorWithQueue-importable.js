// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// this exists to bust circular dependencies.
// if you're getting a circle on this:
//
// import createQueuedConnector from "services/ConnectorWithQueue"
//
// do this instead:
//
// import {importableCreateQueuedConnector as createQueuedConnector } from "services/ConnectorWithQueue-importable"
//
// yes, this is as dumb as it sounds.

export let importableCreateQueuedConnector = () => {}

export function populateImportableCreateQueuedConnector(
  newImportableCreateQueuedConnector
) {
  importableCreateQueuedConnector = newImportableCreateQueuedConnector
}
