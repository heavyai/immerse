// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { useSelector } from "react-redux"
import cx from "classnames"
import { AppState } from "vega/charts/types"
import * as codemirror from "codemirror"
import { SqlNotebookCell } from "./cells/sql-notebook-cell"
import { Splash } from "./splash/splash"
import { isElementVisible, isInputCell } from "./utils"

import "./sql-notebook-workspace.scss"
import { IconArrowRight } from "components/svg-icons/icon-arrow-right"
import { throttle } from "lodash"

const SHOW_LATEST_PAST = 2 // How many cells scroll by before showing latest button
const SCROLLABLE_CELLS_CLASSNAME = "sql-notebook__workspace__cells"
const getCellElAtIndex = (idx: number | null) =>
  document.querySelector(`#sql-notebook-cell-${idx}`)

// Main editor panel; displays all notebook cells and cell creation controls
export const SqlNotebookWorkspace = ({
  setActiveEditor
}: {
  setActiveEditor: (editor: codemirror.Editor) => void
}) => {
  const cells = useSelector((state: AppState) => state.sqlNotebook.cells)
  const scrollToCellIndex = useSelector(
    (state: AppState) => state.sqlNotebook.scrollToCellIndex
  )
  const sqlNotebookLoading = useSelector((state: AppState) => {
    return state.sqlNotebook.loading
  })

  // Scrolling workspace area
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const [showLatest, setShowLatest] = useState(false)

  // Is in state before any queries have run
  // Length check alone is insufficient; SQL result cell replaces the first cell
  const isInit =
    !sqlNotebookLoading && cells.length <= 1 && isInputCell(cells[0])

  useLayoutEffect(() => {
    // Gives the visualization or table a cycle to render
    setTimeout(() =>
      scrollRef.current?.scroll({
        // - 10 is padding on top so it doesn't but right up against the viewport
        top: getCellElAtIndex(scrollToCellIndex)?.offsetTop - 10,
        left: 0,
        behavior: "smooth"
      })
    )
  }, [scrollToCellIndex])

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scroll({
      top: scrollRef.current?.scrollHeight,
      left: 0,
      behavior: "smooth"
    })
  }, [])

  // Separate out the last cell which is a sticky input cell
  // Memoize so we can use in debounced functions
  const restCells = useMemo(() => [...cells], [cells])
  const stickyCell = useMemo(() => restCells.pop(), [restCells])

  const onScroll = useCallback(() => {
    const lastN = restCells.slice(-SHOW_LATEST_PAST)
    const container = document.querySelector(`.${SCROLLABLE_CELLS_CLASSNAME}`)
    const someVisible = lastN.length
      ? lastN.some((cell) => {
          const cellIndex = restCells.indexOf(cell)
          const cellEl = getCellElAtIndex(cellIndex)
          return isElementVisible(cellEl, container)
        })
      : true
    // If none of the last N elements are visible... show the latest button
    setShowLatest(!someVisible)
  }, [restCells])

  const onScrollThrottled = useMemo(() => {
    // Throttle this so it's not triggered on _every_ scroll event.
    // Max once every 200ms, call on front end of timeout
    return throttle(onScroll, 200, { leading: true })
  }, [onScroll])

  return (
    <div
      className={cx("sql-notebook__workspace", {
        "sql-notebook__workspace--init": isInit
      })}
    >
      {isInit && <Splash />}
      <div className="sql-notebook__workspace__content">
        <div
          className={SCROLLABLE_CELLS_CLASSNAME}
          ref={scrollRef}
          onScroll={onScrollThrottled}
        >
          {restCells.map((cell, i) => {
            return (
              <SqlNotebookCell
                cell={cell}
                cellIndex={i}
                key={i}
                setActiveEditor={setActiveEditor}
              />
            )
          })}
          <div
            className={cx("sql-notebook__workspace__latest", {
              "sql-notebook__workspace__latest--enabled": showLatest
            })}
            onClick={scrollToBottom}
          >
            <IconArrowRight /> <span>Latest</span>
          </div>
        </div>
        {stickyCell && (
          <div className="sql-notebook__workspace__cells--sticky">
            <SqlNotebookCell
              cell={stickyCell}
              cellIndex={cells.length - 1}
              key="sticky-cell"
              setActiveEditor={setActiveEditor}
            />
          </div>
        )}
      </div>
    </div>
  )
}
