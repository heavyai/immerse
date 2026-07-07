// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  CONNECTION_ERROR,
  CONNECTION_REQUEST,
  CONNECTION_SUCCESS,
  UPDATE_SESSION_ID,
  SET_CONNECTION_INFO,
  SET_USER_DATA,
  DROP_CONNECTION,
  GET_HARDWARE_INFO_SUCCESS,
  LOAD_GEOJSON_CONFIG,
  RETURN_ON_LOGIN,
  SET_DATABASE_NAME,
  SET_USER_PRIVILEGES,
  SET_USER_ROLES,
  UPDATE_SESSION_INFO
} from "constants/action-types"

import { getErrorMessageFromBackendError } from "utils/error-handling-helpers"
import createReducer from "utils/redux/create-reducer"
import validateMapboxCustomStyles from "utils/validate-mapbox-custom-styles"

export interface CustomStyles {
  logoUrl?: string
  buttonPrimaryColor?: string
  loginText?: string
  colors?: {
    solid?: string[]
    custom?: string[]
    ordinal?: [string[], string[], string[], string[]]
    quantitative?: [string[], string[], string[], string[]]
  }
  title?: string
  disableHelpMenu?: boolean
}

// TGpuSpecification from Thrift
export interface GpuSpecification {
  clock_frequency_kHz: number
  compute_capability_major: number
  compute_capability_minor: number
  memory: number
  num_sm: number
}

// THardwareInfo from Thrift
export interface HardwareInfo {
  gpu_info: GpuSpecification[]
  host_name: string
  num_cpu_hw: number
  num_gpu_allocated: number
  num_gpu_hw: number
  start_gpu: number
}

export interface User {
  database?: string
  username?: string
  password?: string
  url?: string
  customStyles?: CustomStyles
  theme?: string
  protocol?: "http" | "https" | string
  mapboxCustomStyles?: any[]
  host?: string
  port?: number
  GTM?: string
  offline?: boolean
  isDemo?: boolean
  walkme: boolean
  enableDataCatalog?: boolean
}

// heavy.thrift TSessionInfo:
// struct TSessionInfo {
//   1: string user;
//   2: string database;
//   3: i64 start_time;
//   4: bool is_super;
// }
export interface SessionInfo {
  user: string
  database: string
  start_time: number
  is_super: boolean
}

export interface ConnectionState {
  appVersion: null | string
  error: boolean | string
  geoJsonConfig: null | object
  hardwareInfo: HardwareInfo
  isConnected: boolean
  isDataCatalogEnabled: boolean
  isDemo: boolean
  isRenderingEnabled: boolean
  isMSDEnabled: boolean
  isMultiLayeringEnabled: boolean
  isPolyRasterEnabled: boolean
  isPolyRenderingAvailable: boolean
  loading: boolean
  serversJsonPending: boolean
  loadLink: boolean
  nodeCount?: number
  privileges: object
  roles: string[]
  isSuperuser: boolean
  returnOnLogin: string
  sessionId: [string]
  isDevMode: boolean
  user: User
  version?: string
  isCluster?: boolean
  GTM?: string
  sessionInfo: SessionInfo | null
  hostId: string | null
}

export const initialState: ConnectionState = {
  appVersion: null,
  version: null,
  error: false,
  geoJsonConfig: null,
  hardwareInfo: null,
  isConnected: false,
  isDataCatalogEnabled: true,
  isDemo: false,
  isDevMode: false,
  isRenderingEnabled: false,
  isMSDEnabled: true,
  isMultiLayeringEnabled: true,
  isPolyRasterEnabled: false,
  isPolyRenderingAvailable: false,
  loading: false,
  serversJsonPending: true,
  loadLink: false,
  privileges: {},
  roles: [],
  isSuperuser: false,
  returnOnLogin: "/",
  sessionId: null,
  GTM: "",
  user: { isDemo: false, walkme: false },
  sessionInfo: null,
  hostId: null
}

const reducer = {
  [CONNECTION_REQUEST](
    state: ConnectionState,
    { user }: { user: User }
  ): ConnectionState {
    const userCopy = {
      ...user,
      protocol: user.protocol || window.location.protocol,
      mapboxCustomStyles: validateMapboxCustomStyles(user),
      offline: user.offline
    }

    if (state.loadLink) {
      userCopy.database = state.user.database
    }

    delete userCopy.password

    return Object.assign({}, state, {
      loading: true,
      error: false,
      user: userCopy
    })
  },

  [SET_CONNECTION_INFO](
    state: ConnectionState,
    { user }: { user: User }
  ): ConnectionState {
    const userCopy = {
      ...user,
      protocol: user.protocol || window.location.protocol,
      mapboxCustomStyles: validateMapboxCustomStyles(user),
      offline: user.offline
    }

    delete userCopy.password

    return Object.assign({}, state, {
      loading: false,
      serversJsonPending: false,
      error: false,
      user: userCopy
    })
  },

  [SET_USER_DATA]: (
    state: ConnectionState,
    { user }: { user: User }
  ): ConnectionState => ({
    ...state,
    user: {
      ...state.user,
      ...user
    }
  }),

  [CONNECTION_ERROR](state: ConnectionState, { error }): ConnectionState {
    return Object.assign({}, state, {
      loading: false,
      serversJsonPending: false,
      error: getErrorMessageFromBackendError(error)
    })
  },

  [CONNECTION_SUCCESS](
    state: ConnectionState,
    { sessionId, sessionInfo, statuses, GTM }
  ): ConnectionState {
    const status = statuses[0]
    return {
      ...state,
      sessionId,
      GTM,
      isDataCatalogEnabled:
        typeof state.user.enableDataCatalog === "undefined"
          ? true
          : state.user.enableDataCatalog,
      isDevMode: process.env.NODE_ENV !== "production",
      // Demo mode may either be enabled explicitly in servers.json, or implicitly if the server is
      // in read only mode. Both are currently used by our demos (as of Sept. 2019), but
      // servers.json should be preferred going forward.
      isDemo: status.read_only || state.user.isDemo,
      isRenderingEnabled: status.rendering_enabled,
      isPolyRenderingAvailable: status.poly_rendering_enabled,
      version: status.version,
      isCluster: statuses.length > 1,
      nodeCount: statuses.length,
      isMSDEnabled: true,
      isPolyRasterEnabled: status.poly_rendering_enabled,
      isMultiLayeringEnabled: true,
      isConnected: true,
      loading: false,
      error: false,
      hostId: status.host_id ?? "",
      sessionInfo
    }
  },

  [UPDATE_SESSION_INFO]: (
    state: ConnectionState,
    { sessionInfo }
  ): ConnectionState => ({
    ...state,
    sessionInfo
  }),

  [UPDATE_SESSION_ID](state: ConnectionState, { sessionId }): ConnectionState {
    return {
      ...state,
      sessionId
    }
  },

  [GET_HARDWARE_INFO_SUCCESS](
    state: ConnectionState,
    { hardware_info }
  ): ConnectionState {
    return {
      ...state,
      hardwareInfo: hardware_info
    }
  },

  [RETURN_ON_LOGIN](state: ConnectionState, { payload }): ConnectionState {
    return {
      ...state,
      returnOnLogin: payload
    }
  },

  [DROP_CONNECTION](state): ConnectionState {
    return Object.assign({}, state, {
      ...initialState,
      user: state.user,
      serversJsonPending: state.serversJsonPending
    })
  },

  [LOAD_GEOJSON_CONFIG](state: ConnectionState, { config }): ConnectionState {
    return Object.assign({}, state, {
      geoJsonConfig: config
    })
  },

  [SET_DATABASE_NAME](state: ConnectionState, { database }): ConnectionState {
    const updatedDatabase = Object.assign({}, state.user, { database })
    return Object.assign({}, state, {
      user: updatedDatabase,
      loadLink: true
    })
  },

  [SET_USER_PRIVILEGES](
    state: ConnectionState,
    { payload, fetchComplete }
  ): ConnectionState {
    return {
      ...state,
      privileges: {
        fetchComplete: state.privileges.fetchComplete || fetchComplete,
        ...state.privileges,
        ...payload
      }
    }
  },

  [SET_USER_ROLES](
    state: ConnectionState,
    { payload: { isSuperuser, roles } }
  ): ConnectionState {
    return {
      ...state,
      roles,
      isSuperuser
    }
  }
}

export default createReducer(reducer, initialState)

export const customStyleSelector = ({ connection }) =>
  connection.user.customStyles || {}

export const customThemeSelector = ({ connection }) =>
  connection.user.theme || null
