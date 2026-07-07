// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { connect } from "react-redux"
import LoggedOut from "./logged-out"

const mapStateToProps = ({
  connection: {
    user: { SAMLurl }
  }
}) => ({
  SAMLurl: SAMLurl ? `${SAMLurl}?RelayState=/` : null
})

export default connect(mapStateToProps)(LoggedOut)
