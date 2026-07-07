// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from "react"
import Select, { components as ReactSelectComponents } from "react-select"
import FloatingLabel from "@material/react-floating-label"
import NotchedOutline from "@material/react-notched-outline"
import cx from "classnames"

import "./multi-select.scss"

export interface IMultiSelectProps {
  options?: any
  value?: any
  /** When the input changes */
  onChange?: any
  hasError?: boolean
  isRequired?: boolean
  noLabel?: boolean
  className?: string
  components?: any
  placeholder?: string
  isDisabled?: boolean
}

export class MultiSelect extends React.PureComponent<IMultiSelectProps, {}> {
  private SelectContainer = ({ children, ...childProps }) => {
    const labelShouldFloat =
      childProps.hasValue || childProps.selectProps.inputValue
    return (
      <ReactSelectComponents.SelectContainer {...childProps}>
        <span className="select-container-wrapper">{children}</span>
        <NotchedOutline
          notch={childProps.selectProps.noLabel ? false : labelShouldFloat}
        >
          <FloatingLabel
            className={cx("floating-label", {
              "no-label": childProps.selectProps.noLabel
            })}
            float={labelShouldFloat}
          >
            {childProps.selectProps.placeholder}
          </FloatingLabel>
        </NotchedOutline>
      </ReactSelectComponents.SelectContainer>
    )
  }

  private DropdownIndicator = ({ ...props }) => {
    return (
      <ReactSelectComponents.DropdownIndicator {...props}>
        ▾
      </ReactSelectComponents.DropdownIndicator>
    )
  }

  private Placeholder = () => null

  private customStyles = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999
    }),
    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      height: "32px"
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "32px"
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: "4px"
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: "4px"
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0px 6px"
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0
    })
  }

  render() {
    const {
      className,
      hasError,
      isRequired,
      components,
      ...otherProps
    } = this.props
    return (
      <Select
        className={cx("multi-select", className, {
          error: hasError,
          required: isRequired
        })}
        styles={this.customStyles}
        classNamePrefix={"select"}
        components={{
          SelectContainer: this.SelectContainer,
          Placeholder: this.Placeholder,
          DropdownIndicator: this.DropdownIndicator,
          ...components
        }}
        {...otherProps}
      />
    )
  }
}

export default MultiSelect
