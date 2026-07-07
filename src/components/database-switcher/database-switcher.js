// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { getDBAccessList } from "services/session"
import { MultiSelect } from "widgets/multi-select/Multi-select"
import { noop } from "utils/helpers"
import { exchangeSessionAction } from "./database-switcher-action-creators"
import { CustomDatabaseSwitcherOption } from "./custom-database-switcher-option"
import "./database-switcher.scss"
import SingleDatabaseDisplay from "./single-database-display"

const mapStateToProps = (state) => {
  const selectedDb = state.connection.sessionInfo?.database

  return {
    selectedDb
  }
}

const mapDispatchToProps = (dispatch) => ({
  dispatchExchangeSession: (dbName) => dispatch(exchangeSessionAction(dbName))
})

const DatabaseSwitcher = ({
  selectedDb,
  dispatchExchangeSession,
  wrapChange,
  onChange = noop
}) => {
  const [dbAccessList, setDbAccessList] = useState([])
  const options = dbAccessList
    .filter((dbInfo) => dbInfo.dbName !== selectedDb)
    .map((dbInfo) => ({
      label: dbInfo.dbName,
      value: dbInfo.dbName
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  useEffect(() => {
    let isMounted = true
    const asyncFunc = async () => {
      const dbAccessListResp = await getDBAccessList()
      if (isMounted) {
        setDbAccessList(await dbAccessListResp.json())
      }
    }
    asyncFunc()
    return () => {
      isMounted = false
    }
  }, [])

  return options.length ? (
    <MultiSelect
      {...{
        placeholder: "Database",
        className: "database-switcher",
        options,
        value: {
          label: selectedDb,
          value: selectedDb
        },
        components: {
          Option: CustomDatabaseSwitcherOption(
            dispatchExchangeSession,
            wrapChange
          )
        },
        onChange
      }}
    />
  ) : (
    <SingleDatabaseDisplay
      {...{
        selectedDb
      }}
    />
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DatabaseSwitcher)
