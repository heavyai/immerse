// SPDX-FileCopyrightText: Copyright (c) 2026, NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const defaultEqual = (a: any, b: any) => a === b

interface Selector<T> {
  /** selector's name */
  key: string

  /** selector's function */
  func: (...args: any[]) => T

  /** used to determine if the selector's value has changed */
  equal: typeof defaultEqual

  /** selectors that depend on this selector */
  dependents: Selector<any>[]

  /** selectors that this selector depends on */
  dependencies: Selector<any>[]

  /** whether or not this selector's dependencies have changed */
  dirty: boolean

  /** accessor for the selector's current value */
  (): T
}

interface Options {
  /** used to determine if the selector's value has changed */
  equal?: (a: any, b: any) => boolean
}

/**
 * ForwardSelect is similar to reselect, but, whereas reselect has a sort
 * of "pull" model of updating selectors, ForwardSelect implements a
 * "push" model.
 *
 * When you ask a reselect selector for its value, it must recursively
 * walk up its tree of dependencies to see if any have changed. Imagine
 * if you have two selectors, A and B, which each depend on selector C.
 * Imagine selector C has a fairly deep dependency tree of its own.
 * Calling both selector A and B cause selector C's entire dependency
 * tree to run twice. Of course, the values are memoized, so, worst
 * case the actual functions only run once. But, all of the logic to
 * recurse through the dependencies and check for changes must run twice.
 * This logic involves recursion, loops, multiple function calls, and
 * comparisons - not cheap.
 *
 * ForwardSelect starts at the top of the dependency tree. Each "base"
 * selector (ie, selectors without dependencies) runs. If their value
 * changes, they communicate to their dependents that they need to
 * update. Any selector whose dependencies did not change basically does
 * zero work (ok, a single boolean comparison). The whole thing runs in
 * linear time (O(n)).
 */
export default class ForwardSelect<TState, TProps> {
  private selectors: Selector<any>[] = []
  private values: Record<string, any> = {}

  /** Create a selector with the given dependencies */
  createSelector<T>(
    key: string,
    func: (state: TState, props: TProps) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, T>(
    key: string,
    selector1: Selector<R1>,
    func: (arg1: R1) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    func: (arg1: R1, arg2: R2) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    func: (arg1: R1, arg2: R2, arg3: R3) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    func: (arg1: R1, arg2: R2, arg3: R3, arg4: R4) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    func: (arg1: R1, arg2: R2, arg3: R3, arg4: R4, arg5: R5) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    func: (arg1: R1, arg2: R2, arg3: R3, arg4: R4, arg5: R5, arg6: R6) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, R8, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, R8, R9, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, T>(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    T
  >(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    selector14: Selector<R14>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13,
      arg14: R14
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    T
  >(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    selector14: Selector<R14>,
    selector15: Selector<R15>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13,
      arg14: R14,
      arg15: R15
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    R16,
    T
  >(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    selector14: Selector<R14>,
    selector15: Selector<R15>,
    selector16: Selector<R16>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13,
      arg14: R14,
      arg15: R15,
      arg16: R16
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    R16,
    R17,
    T
  >(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    selector14: Selector<R14>,
    selector15: Selector<R15>,
    selector16: Selector<R16>,
    selector17: Selector<R17>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13,
      arg14: R14,
      arg15: R15,
      arg16: R16,
      arg17: R17
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    R16,
    R17,
    R18,
    T
  >(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    selector14: Selector<R14>,
    selector15: Selector<R15>,
    selector16: Selector<R16>,
    selector17: Selector<R17>,
    selector18: Selector<R18>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13,
      arg14: R14,
      arg15: R15,
      arg16: R16,
      arg17: R17,
      arg18: R18
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector<
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    R8,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
    R16,
    R17,
    R18,
    R19,
    T
  >(
    key: string,
    selector1: Selector<R1>,
    selector2: Selector<R2>,
    selector3: Selector<R3>,
    selector4: Selector<R4>,
    selector5: Selector<R5>,
    selector6: Selector<R6>,
    selector7: Selector<R7>,
    selector8: Selector<R8>,
    selector9: Selector<R9>,
    selector10: Selector<R10>,
    selector11: Selector<R11>,
    selector12: Selector<R12>,
    selector13: Selector<R13>,
    selector14: Selector<R14>,
    selector15: Selector<R15>,
    selector16: Selector<R16>,
    selector17: Selector<R17>,
    selector18: Selector<R18>,
    selector19: Selector<R19>,
    func: (
      arg1: R1,
      arg2: R2,
      arg3: R3,
      arg4: R4,
      arg5: R5,
      arg6: R6,
      arg7: R7,
      arg8: R8,
      arg9: R9,
      arg10: R10,
      arg11: R11,
      arg12: R12,
      arg13: R13,
      arg14: R14,
      arg15: R15,
      arg16: R16,
      arg17: R17,
      arg18: R18,
      arg19: R19
    ) => T,
    opts?: Options
  ): Selector<T>
  createSelector(key: string, ...args: any[]): Selector<any> {
    let equal = defaultEqual
    if (!(args[args.length - 1] instanceof Function)) {
      // if the last argument is an options hash, use the equal option
      equal = args.pop().equal || defaultEqual
    }

    const selector = () => this.values[key]
    selector.key = key
    selector.func = args.pop() as (...args: any[]) => any
    selector.equal = equal
    selector.dependents = [] as Selector<any>[]
    selector.dependencies = args as Selector<any>[]
    selector.dirty = true

    // add this selector as a dependant on all of the dependencies
    for (let i = 0; i < args.length; i += 1) {
      args[i].dependents.push(selector)
    }

    // add this selector to the main list
    this.selectors.push(selector)

    return selector
  }

  /** re-run all selectors as necessary */
  recalculate(state: TState, props: TProps) {
    for (let i = 0; i < this.selectors.length; i += 1) {
      const selector = this.selectors[i]
      let newValue = undefined
      let ran = false
      if (selector.dependencies.length === 0) {
        // if this selector has no dependencies, it always runs
        newValue = selector.func(state, props)
        ran = true
      } else if (selector.dirty) {
        // if this selector is dirty, it needs to run
        selector.dirty = false
        newValue = selector.func.apply(
          null,
          selector.dependencies.map((d) => this.values[d.key])
        )
        ran = true
      }

      if (ran && !selector.equal(this.values[selector.key], newValue)) {
        // the selector's value changed - update the value and mark all
        // dependents as dirty
        this.values[selector.key] = newValue
        for (let j = 0; j < selector.dependents.length; j += 1) {
          selector.dependents[j].dirty = true
        }

        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.debug("Selector updated", selector.key)
        }
      }
    }
  }
}
