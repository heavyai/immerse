// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useRef, useEffect } from "react"
import { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"
import cx from "classnames"
import { useDrag, useDrop } from "react-dnd"
import { Link } from "react-router-dom"
import { IconButton } from "widgets/icon-button/Icon-button"
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu"
import {
  duplicateDashboardTab,
  deleteDashboardTab,
  renameDashboardTab
} from "actions/dashboard-action-creators"
import { getDatabase } from "selectors"
import { getGlobalSideNavOffset } from "utils/positioning-helpers"
import { routeToDashboard } from "utils/routerPath"
import { AppState } from "vega/charts/types"
import Portal from "components/portal/Portal"
import { tabDisplayName } from "components/tabs/tabs-utils"
import useOutsideClick from "@rooks/use-outside-click"
import useKey from "@rooks/use-key"

interface OwnProps {
  active: boolean
  dashboardId: string
  index: number
  tabId: string
  containerScrollPosition: number
  restrictViewing: boolean
}

const mapStateToProps = (state: AppState, { tabId }: OwnProps) => ({
  database: getDatabase(state),
  tabName: tabDisplayName(state?.dashboard?.tabs?.[tabId]),
  canDeleteTab: Object.keys(state.dashboard.tabs).length > 1
})

const mapDispatchToProps = (
  dispatch: Dispatch,
  { tabId, dashboardId }: OwnProps
) => {
  return {
    actions: {
      duplicateTab() {
        dispatch(duplicateDashboardTab(tabId))
      },
      renameTab(newTabName: string) {
        dispatch(renameDashboardTab(tabId, newTabName))
      },
      removeTab() {
        dispatch(deleteDashboardTab(tabId, dashboardId))
      }
    }
  }
}

const connector = connect<
  ReturnType<typeof mapStateToProps>,
  ReturnType<typeof mapDispatchToProps>,
  OwnProps,
  AppState
>(mapStateToProps, mapDispatchToProps)

type Props = ConnectedProps<typeof connector> & OwnProps

const Tab: FC<Props> = ({
  active,
  dashboardId,
  database,
  tabId,
  tabName,
  actions,
  containerScrollPosition,
  onMoveTab,
  index,
  canDeleteTab,
  restrictViewing
}) => {
  const menuIconRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuOffset, setMenuOffset] = useState(0)
  const tabRef = useRef(null)
  const nameRef = useRef(null)
  const [nameEditable, setNameEditable] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      setMenuOffset(
        menuIconRef.current?.getBoundingClientRect().left -
          getGlobalSideNavOffset()
      )
    }
  }, [menuOpen, containerScrollPosition])

  const openMenu = () => setMenuOpen(true)

  const closeOnOutsideClick = () => {
    setMenuOpen(false)
    if (nameEditable) {
      actions.renameTab(nameRef.current.textContent)
      setNameEditable(false)
    }
  }

  const onKeyboardEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      actions.renameTab(`${e.currentTarget.textContent}`)
      setNameEditable(false)
      nameRef.current.blur()
    }
  }

  const editTabName = () => {
    setNameEditable(true)
    setMenuOpen(false)
    if (!nameEditable && window.getSelection) {
      setTimeout(() => {
        nameRef.current.focus()

        // Selects/highlights name text after field is in focus
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(nameRef.current)
        selection.removeAllRanges()
        selection.addRange(range)
      }, 0)
    }
  }

  const onDuplicateTab = () => {
    setMenuOpen(false)
    actions.duplicateTab()
  }

  const cancelTabRename = () => {
    setNameEditable(false)
    nameRef.current.textContent = tabName
    nameRef.current.blur()
  }

  useKey(["Escape"], cancelTabRename, {
    when: nameEditable,
    target: nameRef,
    eventTypes: ["keypress", "keydown", "keyup"]
  })

  useOutsideClick(tabRef, closeOnOutsideClick)

  const [, drop] = useDrop({
    accept: "TAB",
    hover(item, monitor) {
      if (!tabRef.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = tabRef.current?.getBoundingClientRect()
      // Get horizontal middle
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the left
      const hoverClientX = clientOffset.x - hoverBoundingRect.left

      // Only perform the move when the mouse has crossed half of the items width
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return
      }
      // Dragging right
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return
      }

      onMoveTab(dragIndex, hoverIndex)

      item.index = hoverIndex
    }
  })

  const [{ isDragging }, drag] = useDrag({
    item: { type: "TAB", id: tabId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  !restrictViewing && drag(drop(tabRef))

  const removeTab = canDeleteTab ? actions.removeTab : () => {}

  return (
    <div
      ref={tabRef}
      className={cx("dashboard-tab", { active, dragging: isDragging })}
    >
      <Link
        key={tabId}
        to={routeToDashboard(database, dashboardId, tabId)}
        replace
      >
        <div
          className={cx("dashboard-tab-name", {
            "dashboard-tab-name--editable": nameEditable
          })}
          ref={nameRef}
          contentEditable={nameEditable}
          suppressContentEditableWarning
          onKeyPress={onKeyboardEnter}
        >
          {tabName}
        </div>
      </Link>
      {!restrictViewing && (
        <div ref={menuIconRef}>
          <IconButton
            className="dashboard-tab-menu-button"
            icon="more_vert"
            onClick={openMenu}
          />
        </div>
      )}
      {menuOpen && (
        <Portal rootId={"dashboard-tab-menu-portal-root"}>
          <MenuSurfaceAnchor style={{ left: menuOffset }}>
            <Menu open className="dashboard-tab-menu" focusOnOpen={false}>
              <MenuItem onMouseUp={onDuplicateTab} className="extra-compact">
                Duplicate
              </MenuItem>
              <MenuItem onMouseUp={editTabName} className="extra-compact">
                Rename
              </MenuItem>
              <MenuItem
                onClick={removeTab}
                disabled={!canDeleteTab}
                className="extra-compact"
              >
                Delete
              </MenuItem>
            </Menu>
          </MenuSurfaceAnchor>
        </Portal>
      )}
    </div>
  )
}

export default connector(Tab)
