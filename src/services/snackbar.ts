// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createSnackbarQueue } from "@rmwc/snackbar"

export const {
  messages: snackbarMessages,
  notify: snackbarNotify
} = createSnackbarQueue()
