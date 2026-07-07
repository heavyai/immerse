// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/*
  function to create mocking proxies around object methods.

  Call as:

  const { proxy, setMocked } = mockProxy (
    object,
    shouldProxy,
    dispatch
  )

  shouldProxy is a function that receives one argument - the method name, and returns true/false to see if it should
  be proxied.
  dispatch is a function that receives two arguments - the original object and the method name. Should return a new mocked
  method.

  Returns the new proxy object to use in place of the original object, and a function to turn the proxying on/off. (true/false)
  Defaults to on.
*/

export default function mockProxy(
  object,
  shouldProxy = () => true,
  getDispatch = (t, p) => t[p]
) {
  let isMocked = true

  const setMocked = (newMocked) => {
    isMocked = newMocked
  }
  const proxy = new Proxy(object, {
    get(target, prop) {
      if (!shouldProxy(prop) || !isMocked) {
        return target[prop]
      } else {
        return getDispatch(target, prop)
      }
    }
  })

  return { proxy, setMocked }
}

/*

  Example usage

  const obj = {
    foo : () => "foo",
    bar : () => "bar"
  }

  const {proxy, setMocked} = mockProxy(
    obj,
    (method) => method === "bar",
    (target, prop) => () => prop.toUpperCase()
  )

  obj.foo()   // 'foo'
  proxy.foo() //  'foo' (because it isn't mocked)
  obj.bar()   // 'bar'
  proxy.bar() // 'BAR' (because it is mocked)
}

*/
