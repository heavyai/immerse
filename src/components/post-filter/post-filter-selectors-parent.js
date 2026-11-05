// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import PostFilterSelectorsContainer from "./post-filter-selectors-container"
import SelectorsContainer from "components/selectors-container/selectors-container"

const EnhancedPostFilterSelectorsParent = SelectorsContainer(
  PostFilterSelectorsContainer
)

export default EnhancedPostFilterSelectorsParent
