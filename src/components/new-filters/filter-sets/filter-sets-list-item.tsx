// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useRef, useState } from "react"

import useOutsideClick from "@rooks/use-outside-click"
import cx from "classnames"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"

import IconDuplicateSolid from "components/svg-icons/icon-duplicate-solid"

const ENTER_DELAY = 500
const TOOLTIP_EDIT = "Edit filter set name"
const TOOLTIP_DUPLICATE = "Duplicate current filter set"
const TOOLTIP_REMOVE = "Remove filter set"

type Props = {
  filterSetId: string | null
  filterSetName: string | null
  deleteFilterSet: (filterSetId: string) => void
  deleteTooltip?: string
  duplicateFilterSet: (filterSetId: string) => void
  duplicateTooltip?: string
  enableDeleteFilterSet: boolean
  renameFilterSet?: (filterSetId: string, name: string) => void
  selectFilterSet: (filterSetId: string) => void
  closeList: () => void
  showAdvancedFilterControls: boolean
}

const FilterSetsListItem: FC<Props> = (props) => {
  const itemRef = useRef(null)
  const nameRef = useRef(null)
  const [nameEditable, setNameEditable] = useState(false)

  const editFilterSetName = () => {
    setNameEditable(!nameEditable)

    if (nameEditable) {
      props.renameFilterSet(props.filterSetId, nameRef.current.textContent)
    }

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

  const renameFilterSet = (e) =>
    props.renameFilterSet(props.filterSetId, `${e.currentTarget.textContent}`)

  const cancelFilterSetRename = () => {
    if (nameEditable) {
      setNameEditable(false)
      nameRef.current.textContent = props.filterSetName
    }
  }

  const selectFilterSet = () => {
    if (!nameEditable) {
      props.closeList()
      props.selectFilterSet(props.filterSetId)
    }
  }

  const onKeyboardEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      renameFilterSet(e)
      setNameEditable(false)
    }
  }

  useOutsideClick(itemRef, cancelFilterSetRename)

  return (
    <div ref={itemRef} className="filter-set-item">
      <div
        className="filter-set-item__title"
        data-testid="filter-set-item"
        onClick={selectFilterSet}
      >
        <div
          className={cx("filter-set-item__title-text", {
            "filter-set-item__title-text--editable": nameEditable
          })}
          ref={nameRef}
          contentEditable={nameEditable}
          suppressContentEditableWarning
          onKeyPress={onKeyboardEnter}
        >
          {props.filterSetName}
        </div>
      </div>
      <div
        className={cx("filter-set-item__buttons", {
          hidden: !props.showAdvancedFilterControls
        })}
      >
        {props.renameFilterSet && (
          <Tooltip
            content={TOOLTIP_EDIT}
            enterDelay={ENTER_DELAY}
            align="right"
          >
            <div
              className="filter-set-item__button-container"
              data-testid="edit-filter-set-button"
              onClick={editFilterSetName}
            >
              <Icon
                className={cx(
                  "filter-set-item__button filter-set-item__button--save filter-set-item__button--active",
                  { hidden: !nameEditable }
                )}
                icon="save"
              />
              <Icon
                className={cx(
                  "filter-set-item__button filter-set-item__button--edit",
                  { hidden: nameEditable }
                )}
                icon="edit"
              />
            </div>
          </Tooltip>
        )}
        <Tooltip
          content={props.duplicateTooltip || TOOLTIP_DUPLICATE}
          enterDelay={ENTER_DELAY}
          align="left"
        >
          <div
            className="filter-set-item__button-container"
            data-testid="duplicate-filter-set-button"
            onClick={() => props.duplicateFilterSet(props.filterSetId)}
          >
            <IconDuplicateSolid className="filter-set-item__button filter-set-item__button--duplicate" />
          </div>
        </Tooltip>
        {props.enableDeleteFilterSet && (
          <Tooltip
            content={props.deleteTooltip || TOOLTIP_REMOVE}
            enterDelay={ENTER_DELAY}
            align="left"
          >
            <Icon
              className="filter-set-item__button filter-set-item__button--remove"
              data-testid="remove-filter-set-button"
              icon="remove_circle_outline"
              onClick={() => props.deleteFilterSet(props.filterSetId)}
            />
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export default FilterSetsListItem
