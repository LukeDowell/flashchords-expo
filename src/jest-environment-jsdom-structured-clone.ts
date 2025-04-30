import JSDOMEnvironment from 'jest-environment-jsdom';
import {cloneDeep} from "lodash"

// ReferenceError: structuredClone is not defined
// https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
// https://github.com/jsdom/jsdom/issues/3363#issuecomment-1467894943
export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // FIXME https://github.com/jsdom/jsdom/issues/3363
    this.global.structuredClone = cloneDeep;
  }
}
