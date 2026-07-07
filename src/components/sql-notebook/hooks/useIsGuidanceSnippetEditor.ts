// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { useIsSuperuser } from "components/settings/selectors/permissionsSelectors"
import { IMMERSE_GUIDANCE_MANAGE_ROLE } from "constants/roles"
import { useUserRoles } from "hooks"

export const useIsGuidanceSnippetEditor = () => {
  const isSuperuser = useIsSuperuser()
  const roles = useUserRoles()

  return isSuperuser || roles.includes(IMMERSE_GUIDANCE_MANAGE_ROLE)
}
