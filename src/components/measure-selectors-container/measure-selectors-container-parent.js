// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import MeasuresSelectorsContainer from "./measure-selectors-container"
import SelectorsContainer from "components/selectors-container/selectors-container"

const EnhancedMeasureSelectorsContainerParent = SelectorsContainer(
  MeasuresSelectorsContainer
)

export default EnhancedMeasureSelectorsContainerParent
