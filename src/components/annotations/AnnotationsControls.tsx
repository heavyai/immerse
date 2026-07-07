// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from "react"
import { Dispatch } from "redux"
import { connect } from "react-redux"
import cx from "classnames"
import { Switch } from "widgets/switch/Switch"
import { Icon } from "@rmwc/icon"
import { Tooltip } from "@rmwc/tooltip"
import Popover from "components/popover/popover"
import AnnotationsEditIcon from "components/svg-icons/icon-annotations-edit"
import AnnotationsHiddenIcon from "components/svg-icons/icon-annotations-hidden"

import { AnnotationState } from "constants/annotations"
import {
  toggleAnnotations,
  toggleAnnotationsEditMode
} from "actions/annotation-action-creators"

import "./AnnotationsControls.scss"

const mapStateToProps = ({ annotations }: AnnotationState) => {
  return {
    isAnnotationsEnabled: annotations.enabled,
    isEditModeEnabled: annotations.editMode
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleEnabled: (isEnabled: boolean) => {
      dispatch(toggleAnnotations(isEnabled))
    },
    toggleEditMode: (isEnabled: boolean) => {
      dispatch(toggleAnnotationsEditMode(isEnabled))
    }
  }
}

const AnnotationsControls: FC = ({
  isAnnotationsEnabled,
  isEditModeEnabled,
  toggleEnabled,
  toggleEditMode
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)

  const IconReadOnly = () => (
    <Tooltip content="Edit annotations on new combo chart" enterDelay={500}>
      <span
        className="annotations-controls__icon"
        onClick={() => toggleEditMode(true)}
      >
        <Icon icon={{ icon: "comment", size: "small" }} />
      </span>
    </Tooltip>
  )

  const IconEdit = () => (
    <Tooltip content="Return to read-only" enterDelay={500}>
      <span
        className="annotations-controls__icon--edit"
        onClick={() => toggleEditMode(false)}
      >
        <AnnotationsEditIcon />
      </span>
    </Tooltip>
  )

  const IconHidden = () => (
    <Tooltip content="Show annotations" enterDelay={500}>
      <span
        className="annotations-controls__icon--hidden"
        onClick={() => {
          toggleEnabled(true)
          toggleEditMode(false)
        }}
      >
        <AnnotationsHiddenIcon />
      </span>
    </Tooltip>
  )

  let icon = <IconHidden />

  if (isAnnotationsEnabled) {
    icon = <IconReadOnly />

    if (isEditModeEnabled) {
      icon = <IconEdit />
    }
  }

  return (
    <div
      className={cx("annotations-controls", {
        "is-dropdown-open": dropdownOpen
      })}
    >
      <div className="annotations-controls__toggle">
        {icon}
        <span
          className="annotations-controls__open-dropdown"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Tooltip content="See more options" enterDelay={500}>
            <Icon icon={{ icon: "arrow_drop_down", size: "small" }} />
          </Tooltip>
        </span>
      </div>
      <Popover isOpened={dropdownOpen} onClose={() => setDropdownOpen(false)}>
        <div className="annotations-controls__dropdown">
          <Switch
            id="annotations-show"
            checked={isAnnotationsEnabled}
            onClick={(e) => toggleEnabled(e.currentTarget.checked)}
          />
          <label htmlFor="annotations-show">Show annotations</label>
        </div>
      </Popover>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationsControls)
