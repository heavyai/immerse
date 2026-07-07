// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createSnackbarQueue } from "@rmwc/snackbar"

// Warning -- snackbar for bulk deleting snippets takes priority and will clear this queue
export const sqlNotebookQueue = createSnackbarQueue()
