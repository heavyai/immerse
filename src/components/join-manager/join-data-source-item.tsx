// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Link } from "@material-ui/core"
import IconJoinLeft from "components/svg-icons/icon-join-left"
import React, { useState } from "react"
import { useDispatch } from "react-redux"
import { ExtendedOption } from "vega/components/SourceSelector/BaseSourceSelector"
import { openJoinManager } from "./join-manager-actions"
import { useJoinFromParameter } from "./use-join-from-parameter"

export const JoinDataSourceItem = ({ item }: { item: ExtendedOption }) => {
  const [hovered, setHovered] = useState(false)
  const dispatch = useDispatch()
  const { parameter, label } = item

  const joinDataSource = useJoinFromParameter(parameter)
  return (
    <div
      className="autocomplete-dropdown-item-content item-with-actions"
      data-testid="join-autocomplete-dropdown-item-content"
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <div className="value">{label}</div>
      <div className="actions">
        {hovered ? (
          <Link
            data-testid="edit-join-data-source"
            color="primary"
            onClick={(e) => {
              // Don't select the item, open the join dialog
              e.preventDefault()
              e.stopPropagation()
              dispatch(
                openJoinManager({
                  joinDefinition: joinDataSource
                })
              )
            }}
          >
            Edit
          </Link>
        ) : (
          <IconJoinLeft
            className="data-source-icon"
            testId="data-source-icon"
          />
        )}
      </div>
    </div>
  )
}
