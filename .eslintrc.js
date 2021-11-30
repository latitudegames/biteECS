module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
  },
  extends: ["eslint:recommended"],
  plugins: ["@typescript-eslint", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  rules: {},
};
