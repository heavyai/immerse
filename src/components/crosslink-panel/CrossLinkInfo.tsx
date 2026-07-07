// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import cx from "classnames"
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import { Switch } from "widgets/switch/Switch"
import IconSourceLink from "components/svg-icons/icon-sourcelink"
import CancelOutlinedIcon from "components/svg-icons/icon-cancel-outlined"
import { CrossLink } from "constants/crosslink-types"
import { useJoinFromParameter } from "components/join-manager/use-join-from-parameter"

import "./CrossLinkInfo.scss"

type Props = {
  crossLink: CrossLink
  isDisabled: boolean
  editCrossLink(): void
  toggleCrossLink(): void
  deleteCrossLink(): void
}

const CrossLinkInfo: FC<Props> = ({
  crossLink,
  isDisabled,
  editCrossLink,
  toggleCrossLink,
  deleteCrossLink
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { sourceA, sourceB, enabled, columnLinks = [] } = crossLink
  const joinDataSourceA = useJoinFromParameter(sourceA)
  const joinDataSourceB = useJoinFromParameter(sourceB)

  const sourceADisplay = joinDataSourceA?.name ?? sourceA
  const sourceBDisplay = joinDataSourceB?.name ?? sourceB

  return (
    <div
      className={cx("crosslink-info", {
        "is-disabled": isDisabled
      })}
    >
      <header>
        <div className="crosslink-info__left">
          <Switch
            className="compact"
            checked={enabled}
            onChange={toggleCrossLink}
          />
          <Tooltip content={sourceADisplay} enterDelay={500}>
            <span className="crosslink-info__source">{sourceADisplay}</span>
          </Tooltip>
        </div>

        <span className="crosslink-info__link-icon">
          <IconSourceLink />
        </span>

        <div className="crosslink-info__right">
          <Tooltip content={sourceBDisplay} enterDelay={500}>
            <span className="crosslink-info__source">{sourceBDisplay}</span>
          </Tooltip>
        </div>

        <MenuSurfaceAnchor
          className={cx("crosslink-info__actions-link", {
            "is-menu-open": isMenuOpen
          })}
        >
          <Menu
            hoistToBody
            open={isMenuOpen}
            onSelect={(e) => {
              e.stopPropagation()
              setIsMenuOpen(false)
            }}
            onClose={(e) => {
              e.stopPropagation()
              setIsMenuOpen(false)
            }}
            focusOnOpen={false}
            anchorCorner="topRight"
            className="crosslink-info__actions-menu"
          >
            <MenuItem className="compact" onClick={editCrossLink}>
              <Icon icon={{ icon: "edit", size: "xsmall" }} />
              Edit cross-link
            </MenuItem>
            <MenuItem className="compact" onClick={deleteCrossLink}>
              <CancelOutlinedIcon />
              Delete cross-link
            </MenuItem>
          </Menu>
          <div
            onClick={(e) => {
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
          >
            <Icon icon={{ icon: "more_vert", size: "xsmall" }} />
          </div>
        </MenuSurfaceAnchor>
      </header>

      <ul>
        {(columnLinks || []).map((columnLink, index) => (
          <li key={`crosslink-info-${crossLink.id}-columnlink-${index}`}>
            <div className="crosslink-info__left">
              <Tooltip content={columnLink.columnA} enterDelay={500}>
                <span className="crosslink-info__column-a">
                  {columnLink.columnA}
                </span>
              </Tooltip>
            </div>
            <span className="crosslink-info__column-operator">=</span>
            <div className="crosslink-info__right">
              <Tooltip content={columnLink.columnB} enterDelay={500}>
                <span className="crosslink-info__column-b">
                  {columnLink.columnB}
                </span>
              </Tooltip>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CrossLinkInfo
