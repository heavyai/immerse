// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { Component } from "react"
import PropTypes from "prop-types"
import cx from "classnames"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { TextField } from "widgets/text-field/TextField"
import { userShape } from "constants/prop-types"
import SegmentedControl from "components/segmented-control/segmented-control"
export default class LoginPanel extends Component {
  static propTypes = {
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    handleConnect: PropTypes.func.isRequired,
    shouldDisableDatabase: PropTypes.bool.isRequired,
    titleName: PropTypes.string.isRequired,
    user: userShape.isRequired,
    isDisabled: PropTypes.bool,
    login_panel_databases: PropTypes.arrayOf(PropTypes.string),
    connectLabel: PropTypes.string,
    usernameLabel: PropTypes.string,
    usernamePlaceholder: PropTypes.string
  }

  static defaultProps = {
    login_panel_databases: [],
    connectLabel: "CONNECT",
    usernameLabel: "Username",
    usernamePlaceholder: ""
  }

  state = {
    submitted: false,
    showSettings: false,
    GTM: null,
    customFields: {},
    userInputs: {
      username: this.props.user.username || "",
      password: this.props.user.password || "",
      protocol: this.props.user.protocol || "",
      port: this.props.user.port || "",
      host: this.props.user.host || "",
      database: this.props.databaseParam || this.props.user.database || ""
    }
  }

  UNSAFE_componentWillReceiveProps({
    user: {
      database = "",
      host = "",
      port = "",
      protocol = "",
      username = "",
      password = "",
      GTM = "",
      ...customFields
    },
    databaseParam
  }) {
    this.setState({
      userInputs: {
        database: databaseParam || database,
        host,
        port,
        protocol,
        username,
        password
      },
      GTM,
      customFields
    })
  }

  settingsToggle = () => {
    this.setState({
      showSettings: !this.state.showSettings
    })
  }

  handleConnect = (e) => {
    e.preventDefault()
    this.setState({ submitted: true })
    this.props.handleConnect({
      ...this.state.customFields,
      ...this.state.userInputs,
      GTM: this.state.GTM,
      database: this.state.userInputs.database
    })
  }

  updateStateValue = (inputType, value) => {
    this.setState({
      userInputs: {
        ...this.state.userInputs,
        [inputType]: value
      }
    })
  }

  handleInputChange = (inputType) => (event) => {
    this.updateStateValue(inputType, event.target.value)
  }

  setProtocolValue = (value) => {
    this.updateStateValue("protocol", value)
  }

  shouldShowError = (error) =>
    (error && this.state.submitted) || error !== "Please enter a username."

  render() {
    const renderAdvancedSettings = false
    return (
      <div className="login-form" data-testid="login-form">
        <div className="login-form-toggle">
          <span
            className="login-error-msg"
            title={this.shouldShowError(this.props.error) && this.props.error}
          >
            {this.shouldShowError(this.props.error) && this.props.error}
          </span>
          <h2>{this.props.titleName}</h2>
          <form onSubmit={this.handleConnect}>
            <label htmlFor="username-field">{this.props.usernameLabel}</label>
            <TextField
              autoFocus
              className="login-field"
              value={this.state.userInputs.username}
              onChange={this.handleInputChange("username")}
              data-testid="username-field"
              id="username-field"
              placeholder={this.props.usernamePlaceholder}
            />
            <label htmlFor="password-field">Password</label>
            <TextField
              className="login-field"
              value={this.state.userInputs.password}
              onChange={this.handleInputChange("password")}
              data-testid="username-field"
              id="password-field"
              type="password"
            />
            <>
              <label htmlFor="database-field">Database</label>
              {this.props.login_panel_databases.length ? (
                <MultiSelect
                  data-testid="db-switcher"
                  id="db-switcher"
                  className="db-switcher"
                  isDisabled={this.props.shouldDisableDatabase}
                  options={this.props.login_panel_databases.map((name) => ({
                    label: name,
                    value: name
                  }))}
                  value={{
                    label: this.state.userInputs.database,
                    value: this.state.userInputs.database
                  }}
                  placeholder={""}
                  onChange={(selected) =>
                    this.updateStateValue("database", selected.value)
                  }
                />
              ) : (
                <TextField
                  className="login-field database-field"
                  disabled={this.props.shouldDisableDatabase}
                  value={this.state.userInputs.database}
                  onChange={this.handleInputChange("database")}
                  data-testid="database-field"
                  id="database-field"
                />
              )}
            </>
            {renderAdvancedSettings && (
              <div className="login-settings-toggle">
                <span
                  className="settings-button"
                  data-testid="login-settings-button"
                  onClick={this.settingsToggle}
                >
                  ADVANCED SETTINGS
                </span>
              </div>
            )}
            {renderAdvancedSettings && (
              <div
                className={cx(
                  { "advanced-settings": this.state.showSettings },
                  { "hide-input": !this.state.showSettings }
                )}
              >
                <label htmlFor="protocol-field">Protocol</label>
                <SegmentedControl
                  id="protocol-field"
                  name="Protocol"
                  options={[
                    {
                      label: "HTTP",
                      value: "http",
                      testid: "http-settings-button",
                      default:
                        this.state.userInputs.protocol === "http" ||
                        !this.state.userInputs.protocol
                    },
                    {
                      label: "HTTPS",
                      value: "https",
                      testid: "https-settings-button",
                      default: this.state.userInputs.protocol === "https"
                    }
                  ]}
                  setValue={this.setProtocolValue}
                />
                <label htmlFor="host-field">Host Name</label>
                <input
                  data-testid="host-field"
                  className="form-control login-field"
                  id="host-field"
                  type="text"
                  value={this.state.userInputs.host}
                  onChange={this.handleInputChange("host")}
                />
                <label htmlFor="port-field">Port</label>
                <input
                  data-testid="port-field"
                  className="form-control login-field"
                  id="port-field"
                  type="text"
                  value={this.state.userInputs.port}
                  onChange={this.handleInputChange("port")}
                />
              </div>
            )}
            <div className="connect-container">
              <button
                data-testid="connect-button"
                className="button primary"
                id="connect-button"
                type="submit"
                disabled={this.props.isDisabled}
              >
                {this.props.connectLabel}
              </button>
            </div>
          </form>
        </div>
        {this.props.isDisabled && <div className="disabled-overlay" />}
      </div>
    )
  }
}
