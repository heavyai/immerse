// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import DimensionsSelectorsContainer from "./dimension-selectors-container"
import SelectorsContainer from "components/selectors-container/selectors-container"

const EnhancedDimensionSelectorsContainerParent = SelectorsContainer(
  DimensionsSelectorsContainer
)

export default EnhancedDimensionSelectorsContainerParent
