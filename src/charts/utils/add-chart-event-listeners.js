// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compose, forEach, keys } from "ramda"

const addChartEventListeners = (listeners) => (props) => (dcChart) =>
  compose(
    forEach((event) => {
      listeners[event](props, dcChart, event)
    }),
    keys
  )(listeners)

export default addChartEventListeners
