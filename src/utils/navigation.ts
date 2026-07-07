// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// browsers are stupid. Standard behavior is metakey + URL opens in back window,
// shift + meta + URL opens in a focused window.
// BUT...we can't open a window in the current event loop and focus it. We have to wait
// for the next tick. :shrug-emoji:
//
// the immediate boolean flag will typically correspond to MouseEvent.shiftKey
export function openUrlInWindow(url: string, immediate: boolean) {
  if (immediate) {
    setTimeout(() => window.open(url), 0)
  } else {
    window.open(url)
  }
}
