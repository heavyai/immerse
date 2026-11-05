// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Require a file path below a real package, excluding virtual-store and scope
// container directories. Every bundled dependency still has its manifest read.
const dependencyLicenseFilter = /(^.*[/\\]node_modules[/\\]((?:@[^/\\]+[/\\])?(?![.@])[^/\\]+))(?=[/\\])/
module.exports = { dependencyLicenseFilter }
