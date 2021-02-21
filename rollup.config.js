import typescript from "rollup-plugin-typescript2";

const packageJson = require("./package.json");

export default {
  input: "src/sync-deps.ts",
  output: [
    { file: packageJson.main, format: "cjs" },
    { file: packageJson.module, format: "esm" },
  ],
  plugins: [typescript({})],
};
