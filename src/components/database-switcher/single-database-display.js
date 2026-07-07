// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React from "react"

const SingleDatabaseDisplay = ({ selectedDb }) => (
  <div className="single-database-display">
    <span className="db-label">Database:</span>
    <span className="db-value" title={selectedDb}>
      {selectedDb}
    </span>
  </div>
)

export default SingleDatabaseDisplay
