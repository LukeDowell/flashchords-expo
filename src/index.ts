import { cloneDeep } from "lodash";

// Attach the polyfill as a Global function
if (!("structuredClone" in globalThis)) {
  console.log("Attached structuredClone!")
  globalThis.structuredClone = cloneDeep
}




import 'expo-router/entry'