// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// we set the default feature flags down at the bottom of this file
import APP_CONFIG from "constants/app-config"

import {
  retrieveFromLocalStorage,
  storeInLocalStorage,
  deleteFromLocalStorage
} from "utils/local-storage"
import { available_feature_flags } from "./available_feature_flags"
import FEATUREFLAG_DEFINITIONS from "./featureflag-definitions.json"

// available_feature_flags used to be populated here, but was moved to allow
// importing them in test environments that do not have access to `window`
// It is re-exported here to prevent a needless, widespread import refactor
export { available_feature_flags }

/*
  The featureflags object itself is not vended out so as not to allow people to mess with it.
  It's built by either pulling out the featureflags from localStorage OR constructing a new
  one from the featureflag_definitions JSON file.

  That file is a JSON file:
  [
    {
      "key" : "someKey", // optionally - "someGroup/someKey"
      "type" : "number", // number, string, boolean, dropdown
      "description" : "Number of ms that ComboChart must pause before re-executing a query",
      "default" : 100,
      "constant" : "SOME_KEY" // defines a constant name to use to look up this key
      "hidden" : true/false // if true, this flag will -not- show up in the control-panel ui.
    },
    ...
  ]

  Each feature flag object has several keys, all of which are required:

  key - the name of the feature flag, and what you'll use in getFeatureFlag(key) to get the value.
  Optionally, you can put flags into a single layer of groups if you want to cluster keys together.
  "bar" is a key. "foo/bar" is a group. You can retrieve all keys in a given group. Note that internally,
  even if you're using a group, the keys are still stored as a flag object.

  type - the type of value the key will contain. Currently:
    number, string, boolean, dropdown (to force the user to select from several pre-defined values)

  description - a human readable description of the flag.
  default - the default value of the flag.
  migrate - an old localStorage value to migrate into the featureflags here. This will be deprecated/changed
            in the future. Mainly, we just need to pull over darkmode values now.
  migrateVals - an object which contains obsolete featureflag values which we no longer use, pointing to their
                new values (e.g. dark -> heavier). NOTE. This will run in a loop as long as a key is present.
                So you can add { dark : "heavier", "heavier" : "heaviest" }, and that will automatically migrate
                a dark value all the way through to heaviest. You don't need an interim {dark : "heaviest"} mapping.
                It's also smart enought o ignore circular values, and will warn you about it.
                This is really only useful for dropdown values. We could add something more robust for numeric,
                and possibly use it to force a boolean value to be true/false. But mostly dropdowns.

  Note that the feature flags will -not- be stored in localStorage until setFeatureFlag is set.

  Also note that this is assumed to be wired up to only use the featureflag_definitions json hash, but
  could be extended to use other json files as well. Or anything else.

  Final note - this is largely intended to be a stepping stone. Right now this wraps up all the
  old implementations of random localStorage calls to stick flags and puts 'em behind a common API,
  in the hopes of potentially eventually changing the storage location to somewhere else and being
  able to do it transparently to the user and w/o modifying other code than the get/set methods here.

*/

// okay, setup is a little tedious. First thing we do is pull out any flags the user has
// already set.
const featureflags = retrieveFromLocalStorage("featureflags", {
  defaultValue: {},
  asJSON: true
})

// featureflags up above stores the values specified by the user. The defaults were specified elsewhere -
// either in the featureflag-definitions.json file or servers(.local)?.json
const defaults = {}

const serversJson = {}

// keep a list of feature flags by their key.
const valid_feature_flags = {}

// I just don't want to pull in another npm package just for this. So do a simple parse for the moment.
// This is so if a feature flag exposed a query param AND the user has set it, we can read it in
// directly from the URL with no extra steps required
const queryString = window.location.search
  .replace(/^\??/, "")
  .split(/[;&]/)
  .map((pair) => pair.split(/=/))
  .reduce((query, [key, value]) => {
    query[decodeURIComponent(key)] = decodeURIComponent(value)
    return query
  }, {})

// next, we need to look through our defined feature flags and migrate any of them that may
// be under an old key.
FEATUREFLAG_DEFINITIONS.forEach((flag) => {
  // first of all, note that this is a valid feature flag.
  valid_feature_flags[flag.key] = flag

  const flagMigration = retrieveFromLocalStorage(flag.migrate)

  // first of all, if we need to migrate an old key, do it.
  if (flag.migrate) {
    if (flagMigration !== undefined) {
      if (flag.type === "boolean" && flagMigration === "on") {
        setFeatureFlag(flag.key, true)
      } else {
        setFeatureFlag(flag.key, flagMigration)
      }
      deleteFromLocalStorage(flag.migrate)
    }
  }

  // if we need to migrateVals, then do that.
  if (flag.migrateVals && featureflags[flag.key] !== undefined) {
    let currentVal = featureflags[flag.key]
    const seenVals = new Set([currentVal])
    while (flag.migrateVals[currentVal]) {
      currentVal = flag.migrateVals[currentVal]
      if (seenVals.has(currentVal)) {
        // eslint-disable-next-line
        console.error(
          `Cannot migrate feature flag ${flag.key} : ${
            featureflags[flag.key]
          } would create a circle`
        )
        currentVal = featureflags[flag.key]
        break
      }
      seenVals.add(currentVal)
    }
    setFeatureFlag(flag.key, currentVal)
  }

  // next, if we have a default, set it as a default.
  if ("default" in flag) {
    defaults[flag.key] = flag.default
  }

  // if we want to expose this feature flag in the console, do so
  if (flag.console_function) {
    window[flag.console_function] = (value) => {
      const validated = parsedFlagValue(value, flag)
      if (validated === undefined) {
        // eslint-disable-next-line no-console
        console.log(
          `Cannot set ${flag.key} to ${value}. Must be of type ${flag.type}`
        )
        return ""
      } else {
        return setFeatureFlag(flag.key, validated)
      }
    }
  }

  // if the flag exposes itself as a query param AND we have a value, then use it.
  if (flag.query_param && queryString[flag.query_param]) {
    const value = parsedFlagValue(queryString[flag.query_param], flag)
    if (value !== undefined) {
      setFeatureFlag(flag.key, value)
    }
  }
})

// And...defaults can also be set in the servers(.local)?.json file. So when the app starts up,
// the setConnectionInfo action will fire this off when any defaults that have been set there.
// it should be expected to fire once and only once.
//
// Finally, at that point, we consider setup to be fully complete. Which is why in the middle
// of this method we will log out the flags, if we have the flag stating to do so.
export function setDefaultFeatureFlags(newDefaults = {}) {
  Object.entries(newDefaults).forEach(([flag, value]) => {
    defaults[flag] = value
    serversJson[flag] = value
  })

  // So now we can log out our available flags + their current values
  if (getFeatureFlag(available_feature_flags.LOG_FEATURE_FLAGS)) {
    logFeatureFlags()
  }
}

// and now we're finally done with set up

function logFeatureFlags() {
  // eslint-disable-next-line no-console
  console.groupCollapsed("Feature flags")
  FEATUREFLAG_DEFINITIONS.filter(
    (flag) => getFeatureFlag(flag.key) !== undefined
  ).forEach((flag) =>
    // eslint-disable-next-line no-console
    console.log(`${flag.key} : ${getFeatureFlag(flag.key)}`)
  )
  // eslint-disable-next-line no-console
  console.groupEnd("Feature flags")
}

/*
  getFeatureFlag will return the value of the given flag.

  getFeatureFlag("ui_theme")

  Maybe over the long term we can extend these get/set methods to accept a second parameter - "store".

  getFeatureFlag("ui_theme", "local")
  getFeatureFlag("ui_theme", "session")
  getFeatureFlag("ui_theme", "server")

  to allow us to specify flags in multiple locations, and even an ordering of where things can get
  overridden or replaced. But that's a future item.
*/

export function getFeatureFlag(keyPath) {
  if (!valid_feature_flags[keyPath]) {
    throw Error(`getFeatureFlag on invalid flag : ${keyPath}`)
  }
  // if the keyPath is defined in featureflags, use it. Otherwise, use the default.
  return keyPath in featureflags ? featureflags[keyPath] : defaults[keyPath]
}

/* Checks if a feature flag was actually set, or if it will use a default value */
export function isFeatureFlagSet(keyPath) {
  if (!valid_feature_flags[keyPath]) {
    return false
  }

  // We need to distinguish a feature flag being set somewhere vs defaulting from the definition
  return keyPath in featureflags || keyPath in serversJson
}

/*
  getFeatureFlagDefinition will return the entry in the featureflag_definitions.json file for a given flag.

  const def = getFeatureFlagDefinition(keyPath)
*/

export function getFeatureFlagDefinition(keyPath) {
  if (!valid_feature_flags[keyPath]) {
    throw Error(`getFeatureFlag on invalid flag : ${keyPath}`)
  }

  return FEATUREFLAG_DEFINITIONS.find((flag) => flag.key === keyPath)
}

/*
  devs can see all flags
  admins can see super or user flags
  users can only see user flags
*/
export const checkPermission = (flagPermission, myPermission) => {
  if (myPermission === "dev") {
    return true
  } else if (myPermission === "super" && flagPermission !== "dev") {
    return true
  } else if (myPermission === "user" && flagPermission === "user") {
    return true
  } else {
    return false
  }
}

/*
  given a feature flag group, will return an array with the feature flags in that group. So if you have:
    dev/sqlllogging
    dev/reduxtrace
    dev/reduxlogging

  you can do this:
    const devFlags = getFeatureFlagGroup("dev")
  to return:
    [ "dev/sqllogging", "dev/reduxtrace", "dev/reduxlogging" ]
  or whatever the values are.

  You -should- call this function with the second permission argument to filter down to flags only visible
  to that user permission - hand in "user", "super", or "dev". Otherwise it defaults to "dev" and you get all flags.

*/

export function getFeatureFlagsInGroup(group, permission = "dev") {
  const groupRegex = new RegExp(`^${group}/`)
  return FEATUREFLAG_DEFINITIONS.filter(
    (flag) =>
      flag.key.match(groupRegex) && checkPermission(flag.permission, permission)
  ).reduce((flags, flag) => [...flags, flag.key], [])
}

/*
  called with no arguments - returns an array of all of the feature flag groups
*/

export function getAllFeatureFlagGroups() {
  const groupSet = FEATUREFLAG_DEFINITIONS.reduce((groups, flag) => {
    const group = groupForFlag(flag.key)
    if (group !== undefined) {
      groups.add(group)
    }
    return groups
  }, new Set())

  return Array.from(groupSet).sort()
}

/*
  given a feature flag, will return its group. This is currently defined as
  "whatever is before the first /"

  const group = groupForFlag("dev/SQLLogging") // group === "dev"
*/

export function groupForFlag(keyPath) {
  if (!valid_feature_flags[keyPath]) {
    throw Error(`setFeatureFlag on invalid flag : ${keyPath}`)
  }

  const [group, ...other] = keyPath.split("/")
  return group && other.length > 0 ? group : undefined
}

/*
  Given a key/value pair, updates the value of that flag and saves it.

  setFeatureFlag(keyPath, value)
*/

export function setFeatureFlag(keyPath, value) {
  if (!valid_feature_flags[keyPath]) {
    throw Error(`setFeatureFlag on invalid flag : ${keyPath}`)
  }
  featureflags[keyPath] = value
  saveAllFeatureFlags()

  return value
}

function saveAllFeatureFlags() {
  const featureFlagString = JSON.stringify(
    Object.keys(featureflags).reduce((bucket, flag) => {
      if (valid_feature_flags[flag] && !valid_feature_flags[flag].transient) {
        bucket[flag] = featureflags[flag]
      }
      return bucket
    }, {})
  )
  storeInLocalStorage("featureflags", featureFlagString)
}

/*
  Given a key/value pair, explicitly removes the value of that flag.

  removeFeatureFlag(keyPath)

  Important note - This will remove the locally defined flag, but NOT replace it
  with the default. Use with caution!
*/

export function removeFeatureFlag(keyPath) {
  delete featureflags[keyPath]
  saveAllFeatureFlags()
}

// types are : number, boolean, dropdown
// otherwise, by default it's a string. So anything's fair game.
export function parsedFlagValue(value, flag) {
  if (value === undefined) {
    return value
  }

  if (flag.type === "number") {
    const number = parseFloat(value)
    if (!Number.isNaN(number)) {
      return number
    }

    return undefined
  } else if (flag.type === "boolean") {
    if (value === "true" || value === true) {
      return true
    } else if (value === "false" || value === false) {
      return false
    }

    return undefined
  } else if (flag.type === "dropdown") {
    const options = flag.options.map((option) => option.value)
    if (options.includes(value)) {
      return value
    }

    return undefined
  }

  return value
}

setDefaultFeatureFlags(APP_CONFIG.feature_flags)
