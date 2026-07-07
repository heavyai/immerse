// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import ImportProgress from "./import-progress"

export const mapStateToProps = ({ importer }) => ({
  currentFile: importer.currentFileUploading,
  status: importer.status,
  startTime: importer.startTime,
  estimatedEndTimes: importer.estimatedEndTimes
})

export default connect(mapStateToProps)(ImportProgress)
