// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useMemo } from "react"
import { useSelector } from "react-redux"
import { TUserDefinedTableFunction } from "@heavyai/connector/dist/browser-connector"
import { TextField } from "widgets/text-field/TextField"
import { List, SimpleListItem } from "@rmwc/list"
import groupBy from "lodash/groupBy"
import TableFunctionDetailsItem from "./table-function-details-item"
import "./table-function-browser.scss"

export type TableFunctionBrowserProps = {
  sourceSelectOptions: [{ options: [{ label: string; value: string }] }]
  onSelectFunction: (func: string) => void
}

const TableFunctionBrowser: FC<TableFunctionBrowserProps> = ({
  onSelectFunction,
  sourceSelectOptions
}) => {
  const loading = useSelector(
    (state) => state.backendFunctions?.loadingTableFunctions
  )
  const tableFunctions = useSelector(
    (state) => state.backendFunctions?.tableFunctions || []
  )
  const tableFunctionsMap: Record<
    string,
    TUserDefinedTableFunction[]
  > = useMemo(() => {
    if (loading) {
      return {}
    }
    return groupBy(tableFunctions, "name")
  }, [loading, tableFunctions])
  const [searchText, setSearchText] = useState("")
  const [selectedTF, setSelectedTF] = useState<string>()

  const filteredFunctionList = Object.keys(
    tableFunctionsMap
  ).filter((functionName) =>
    functionName.toLowerCase().includes(searchText.trim().toLowerCase())
  )

  if (loading) {
    return <h4>Loading...</h4>
  }

  return (
    <div className="function-browser-wrapper">
      {selectedTF ? null : (
        <div className="function-search">
          <TextField
            icon="search"
            className="function-search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            label="Search Table Functions"
            trailingIcon={
              searchText.length
                ? {
                    className: "function-search-input__input__close",
                    icon: "close",
                    onClick: () => setSearchText("")
                  }
                : null
            }
          />
        </div>
      )}
      <div className="function-browser-body">
        <List>
          {selectedTF ? (
            <TableFunctionDetailsItem
              functionName={selectedTF}
              onSelectFunction={onSelectFunction}
              functionSignatures={tableFunctionsMap[selectedTF]}
              sourceSelectOptions={sourceSelectOptions}
              goBack={() => setSelectedTF(undefined)}
            />
          ) : (
            <>
              {filteredFunctionList.map((name) => (
                <SimpleListItem
                  key={name}
                  text={name}
                  metaIcon="chevron_right"
                  onClick={() => setSelectedTF(name)}
                />
              ))}
            </>
          )}
        </List>
      </div>
    </div>
  )
}

export default TableFunctionBrowser

/**
 * <CollapsibleList
 key={name}
 handle={<SimpleListItem text={name} metaIcon="chevron_right" />}
 >
 <TableFunctionDetailsItem
 functionName={name}
 onSelectFunction={onSelectFunction}
 functionSignatures={tableFunctionsMap[name]}
 sourceSelectOptions={sourceSelectOptions}
 />
 </CollapsibleList>
 */
