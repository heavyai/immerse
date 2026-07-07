// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState, useEffect } from "react"
import { SimpleDialog } from "widgets/dialog/Dialog"
import SegmentedControl from "components/segmented-control/segmented-control"
import moment from "moment"
import {
  TTableRefreshInfo,
  TTableRefreshIntervalType,
  TTableRefreshTimingType,
  TTableRefreshUpdateType
} from "@heavyai/connector/dist/browser-connector"
import TriggerAtField from "./TriggerAtField"
import RepeatEveryField from "./RepeatEveryField"

import "./styles.scss"

export type TableRefreshScheduleModalProps = {
  open: boolean
  onClose: () => void
  onSave: (newRefreshInfo: TTableRefreshInfo) => void
  refreshInfo?: TTableRefreshInfo
}

const refreshInfoToIntervalString = ({
  interval_type,
  interval_count
}: TTableRefreshInfo): string => {
  const type = interval_type === TTableRefreshIntervalType.DAY ? "D" : "H"
  return `${interval_count === -1 ? 1 : interval_count}${type}`
}

const TableRefreshScheduleModal: FC<TableRefreshScheduleModalProps> = ({
  open = false,
  onClose = () => {},
  onSave = () => {},
  refreshInfo
}) => {
  const [formFields, setFormFields] = useState<{
    update_type: "ALL" | "APPEND"
    timing_type: "SCHEDULED" | "MANUAL"
    start_date_time: Date | null
    interval: string
  }>({
    update_type: "ALL",
    timing_type: "MANUAL",
    start_date_time: moment()
      .add(1, "day")
      .startOf("day")
      .add(12, "hours")
      .toDate(),
    interval: "7D"
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (refreshInfo) {
      setFormFields((curr) => ({
        timing_type:
          refreshInfo.timing_type === TTableRefreshTimingType.MANUAL
            ? "MANUAL"
            : "SCHEDULED",
        update_type:
          refreshInfo.update_type === TTableRefreshUpdateType.ALL
            ? "ALL"
            : "APPEND",
        start_date_time: refreshInfo.start_date_time
          ? new Date(refreshInfo.start_date_time)
          : curr.start_date_time,
        interval:
          refreshInfo.intervalType === TTableRefreshIntervalType.NONE
            ? curr.interval
            : refreshInfoToIntervalString(refreshInfo)
      }))
    }
  }, [refreshInfo])

  return (
    <SimpleDialog
      title="Schedule Data Refresh"
      open={open}
      primaryLabel={"Save"}
      primaryDisabled={!formFields.start_date_time || loading}
      primaryAction={async () => {
        setLoading(true)
        await onSave({
          update_type: TTableRefreshUpdateType[formFields.update_type],
          timing_type: TTableRefreshTimingType[formFields.timing_type],
          interval_type: formFields.interval.includes("D")
            ? TTableRefreshIntervalType.DAY
            : TTableRefreshIntervalType.HOUR,
          interval_count: parseInt(
            formFields.interval.replace(/(^\d+)(.+$)/i, "$1"),
            10
          ),
          start_date_time: formFields.start_date_time
        })
        onClose()
      }}
      secondaryAction={onClose}
      onCloseFromHeader={onClose}
    >
      <div className="table-refresh-container">
        <div className="table-refresh-form-wrapper">
          <div className="table-refresh-form-subform-selector">
            <label
              htmlFor="table-refresh-scope"
              className="table-refresh-form-label"
            >
              <div className="table-refresh-scope">Scope of refresh</div>
            </label>
            <SegmentedControl
              id="table-refresh-scope"
              name="tableRefreshScope"
              options={[
                {
                  label: "All",
                  value: "ALL",
                  default: formFields.update_type === "ALL"
                },
                {
                  label: "Append",
                  value: "APPEND",
                  default: formFields.update_type === "APPEND"
                }
              ]}
              setValue={(update_type: "ALL" | "APPEND") =>
                setFormFields((fields) => ({ ...fields, update_type }))
              }
            />
          </div>
          <div className="table-refresh-form-subform-selector">
            <label
              htmlFor="table-refresh-scope"
              className="table-refresh-form-label"
            >
              <div className="table-refresh-scope">Timing type</div>
            </label>
            <SegmentedControl
              id="table-refresh-scope"
              name="tableRefreshScope"
              options={[
                {
                  label: "Scheduled",
                  value: "SCHEDULED",
                  default: formFields.timing_type === "SCHEDULED"
                },
                {
                  label: "Manual",
                  value: "MANUAL",
                  default: formFields.timing_type === "MANUAL"
                }
              ]}
              setValue={(timing_type: "MANUAL" | "SCHEDULED") =>
                setFormFields((fields) => ({ ...fields, timing_type }))
              }
            />
          </div>
          {formFields.timing_type === "SCHEDULED" && (
            <div className="table-refresh-form-row">
              <div className="table-refresh-form-col">
                <label
                  htmlFor="table-refresh-datetime"
                  className="table-refresh-form-label"
                >
                  <div className="table-refresh-datetime">Trigger at</div>
                </label>
                <TriggerAtField
                  id={"table-refresh-datetime"}
                  value={formFields.start_date_time}
                  onChange={(start_date_time) =>
                    setFormFields((fields) => ({ ...fields, start_date_time }))
                  }
                />
              </div>
              <div className="table-refresh-form-col">
                <label
                  htmlFor="table-refresh-interval-number"
                  className="table-refresh-form-label"
                >
                  <div className="table-refresh-datetime">Repeat Every</div>
                </label>
                <RepeatEveryField
                  idPrefix={"table-refresh-interval"}
                  value={formFields.interval}
                  onChange={(interval) =>
                    setFormFields((fields) => ({ ...fields, interval }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleDialog>
  )
}

export default TableRefreshScheduleModal
