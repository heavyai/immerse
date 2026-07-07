// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  MagicCache is a powerful memoizer with numerous options.

  General pattern is:

  const cachedFunc = makeCached( func, options )

  e.g.,

  const func = val => val.toUpperCase()
  const cachedFunc = makeCached( func, { memoized : true })

  func("a") // returns "A"
  func("a") // retunrs "A", but recalculates the toUpperCase() value.
  cachedFunc("a") // returns "A"
  cachedFunc("a") // returns "A", but retrieves it from the cache.

  Obviously, this example is contrived and you should only use it for expensive operations. Read on for the options:

  makeCached options
    maxCacheSize - how many keys to cache (defaults to 10)
      the cache will never grow beyond this number of values, and old elements will be automatically evicted.
    keyAge - how many ms to keep a cached item valid (defaults to 1000)
      a cached value is only considered valid if it was added not more than `keyAge` ms in the past. If it's older than that,
      then the function will re-run.
    validCachedValue - optional function to determine if cache is expired gets args of {key, val, accessTime, keyAge }
      the default validator merely checks to see if the keyAge of a cached value is <= the keyAge (or undefined).
      If you provide a custom validator, you will be required to validate the keyAge yourself.
      defaultCacheValidator is exported.
      signature is - cacheValidator( { key, val, accessTime, keyAge } )
        where key is the memoized key to look up in the cache.
        val is the value retrieved from the cache.
        accessTime is the time it was added to the cache, in ms since epoch.
        keyAge is the value defined up above.
    shared - used shared caching of this function (defaults to false)
      if a cached function is shared, then re-caching it will return the same memoized function. If not, you'll get a new function.
      e.g.:
        const func = a => a
        const cachedA = makeCached(func, { shared : false })
        const cachedB = makeCached(func, { shared : false })
        console.log("these functions are not shared, and are distinct:", cachedA !== cachedB)

        const cachedA = makeCached(func, { shared : true })
        const cachedB = makeCached(func, { shared : true })
        console.log("these functions are shared and identical:", cachedA === cachedB)
    memoizer - memoizer to use for args, if called via the .memoized option
      the memoizer creates the key that stores the value in the cache. By default, it will take the argument array and stringify it into
      json. You will probably want to override this.
    memoized - return the memoized function by default, or the raw one. defaults true
      makeCached returns a function which accepts a cacheKey as its argument. that function then returns a function with the same signature as the original.
      e.g.:
        const someFunc = (a,b,c) => [a,b,c]
        const cachedFunc = makeCached(someFunc)
        cachedFunc(1,2,3) // returns [1,2,3], and the cacheKey is "[1,2,3]"
      Internally, this will use the passed memoizer to create a key. You may not want to do this and may instead want to externally calculate and hand in values.

      You can do that by turning off memoized:
      e.g.:
        const someFunc = (a,b,c) => [a,b,c]
        const cachedFunc = makeCached(someFunc, { memoized : false })
        cachedFunc("[1,2,3]")(1,2,3) // returns [1,2,3], with the given cache key of "[1,2,3]"

      Please note that the raw function will always return a function - it's either a trivial one that returns the cached value no matter what or will invoke the
      original function. You probably don't want to save it that interim function, but it may be useful for even more advanced caching purposes. Or maybe you
      want to cache the value based upon something -other- than the initial arguments. You can do that here, too.

      Please don't use it unless you know what you're doing, and probably not even then.

      Also note that even if memoized is set to true, you can access the cached function via:
        cachedFunc.memoized("[1,2,3]")(1,2,3)
      if you need to
    shouldCache - (optional, defaults to always true) a function to determine if a value should go into the cache at allj
      You may want to call your cached functions with certain values that should bypass caching entirely. Maybe the results are too big or too volatile?
      You can pass a custom function here to prevent items from going into the cache.
      signature is : { cache, key, val, maxCacheSize }
    cache - a shared cache object to use, which should be a Map(). if blank, defaults to an internal one
      Consider the following:
        const funcA = a => a.toUpperCase()
        const funcB = b => b.toUpperCase()

        const cachedA = makeCached(funcA)
        const cachedB = makeCached(funcB)

        funcA and funcB do the same thing, but they do not share a cache. So if you call cachedA with "foo" and then cachedB with "foo", it will re-calculate.
        To fix this, you can use a shared cache:

        const cache = new Map()
        const sharedA = makeCached(funcA, { cache : sharedCache })
        const sharedB = makeCached(funcB, { cache : sharedCache })

        Now they share a cache.

      This is so common that there is a utility function to generate a shared cache, based on a key:
        const shared = getSharedCache(key)
        const sharedA = makeCached(funcA, { cache : shared })

      You can also call clearSharedCache(key) to remove it, and purgeSharedCache() to delete all shared caches.
      NOTE - clearing or purging caches will -not- invalidate them, merely clear out the global storing them. Any cached functions will still work, but newly
      created shared cache functions will get something unique and be decoupled.
*/

const sharedCache = new Map()

export function getSharedCache(key) {
  if (sharedCache.get(key) === undefined) {
    sharedCache.set(key, new Map())
  }
  return sharedCache.get(key)
}

export function clearSharedCache(key) {
  sharedCache.delete(key)
}

export function purgeSharedCache() {
  sharedCache.clear()
}

function saveInCache({ cache, key, val, maxCacheSize }) {
  cache.set(key, { accessTime: Date.now(), val })

  if (cache.size > maxCacheSize && maxCacheSize > 0) {
    for (const [k] of cache.entries()) {
      cache.delete(k)
      if (cache.size <= maxCacheSize) {
        break
      }
    }
  }
}

function removeFromCache({ cache, key }) {
  cache.delete(key)
}

function retrieveFromCache({ cache, key, keyAge, validCachedValue }) {
  const cacheVal = cache.get(key)

  return cacheVal !== undefined &&
    validCachedValue({
      key,
      val: cacheVal.val,
      accessTime: cacheVal.accessTime,
      keyAge
    })
    ? cacheVal
    : undefined
}

function purgeCache({ cache, validCachedValue, keyAge }) {
  cache.forEach((val, key) => {
    const cacheVal = cache.get(key)
    const valid = validCachedValue({
      key,
      val,
      accessTime: cacheVal.accessTime,
      keyAge
    })
    if (!valid) {
      cache.delete(key)
    }
  })
}

// eslint-disable-next-line
export function defaultCacheValidator({ key, val, accessTime, keyAge }) {
  return !keyAge || accessTime + keyAge > Date.now()
}

function defaultMemoizer(...args) {
  return JSON.stringify(args)
}

const cachedFunctions = new Map()

export function makeCached(func, options = {}) {
  const {
    validCachedValue = defaultCacheValidator,
    maxCacheSize = 10,
    keyAge = 1000,
    shared = false,
    memoizer = defaultMemoizer,
    memoized = true,
    shouldCache = () => true,
    cache = new Map()
  } = options

  // okay, if it's not shared OR we don't have a cached version, make a new one.
  if (!cachedFunctions.get(func) || !shared) {
    // the raw cachedFunction takes a key, which it then uses to return the appropriate function
    const cachedFunc = (key) => {
      // look for a cached value
      const cachedValue = retrieveFromCache({
        cache,
        key,
        keyAge,
        validCachedValue
      })
      // and if we have one, return a function that returns its value.
      if (cachedValue) {
        // keep the args value around for the console. Clean it up with the commented line on 111
        // eslint-disable-next-line
        return (...args) => cachedValue.val
      }

      // otherwise, we create a new function that takes any arbitrary args
      return (...args) => {
        // and passes them through to the originatin function.
        const res = func(...args)
        // if we shouldn't cache the return, just return it
        if (!shouldCache(...args)) {
          return res
        }
        // otherwise, save it in the cache, retrieve the cached value, and send that through.
        // we save/retrieve just in case the cache transforms the return in some manner. Not that it currently does.
        saveInCache({ cache, key, val: res, maxCacheSize })
        return res
      }
    }

    // utiity functions tacked onto the raw flavor - evict will remove a value from the cache
    cachedFunc.evict = (key) => removeFromCache({ cache, key })
    // purge will remove all cached values
    cachedFunc.purge = () => purgeCache({ cache, validCachedValue, keyAge })
    // and the memoized function (returned by default) will invoke the memoizer automatically for us based upon args
    cachedFunc.memoized = (...args) => {
      const key = memoizer(...args)
      return cachedFunc(key)(...args)
    }
    // we also maintain a reference to the original value.
    cachedFunc.original = func

    cachedFunctions.set(func, cachedFunc)
  }

  const cachedFunc = cachedFunctions.get(func)
  if (!shared) {
    cachedFunctions.delete(func)
  }

  return memoized ? cachedFunc.memoized : cachedFunc
}
