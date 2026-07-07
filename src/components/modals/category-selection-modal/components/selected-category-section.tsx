// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from "react"
import { Icon } from "@rmwc/icon"
import { Category } from "components/modals/category-selection-modal/category-selection-modal"

interface Props {
  selectedCategories: Category[]
  deselectCategory: (categoryId: string) => void
}

const SelectedCategorySection: FC<Props> = (props) => (
  <div className="selected-category-section selections-pill-container">
    <div className="csm-selected-category-scroller">
      {props.selectedCategories.map((category) => (
        <div key={category} className="selection-pill">
          {category}
          <div className="pill-close">
            <Icon
              icon="cancel"
              onClick={() => props.deselectCategory(category)}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default SelectedCategorySection
