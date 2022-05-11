module.exports = {
  root: true,
  plugins: ["sort-imports-es6-autofix", "mocha"],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "prettier",
    "@vue/prettier",
    "plugin:mocha/recommended",
  ],
  rules: {
    "vue/order-in-components": ["error"],
    "no-console":
      process.env.NODE_ENV === "production"
        ? ["error", { allow: ["error"] }]
        : ["warn", { allow: ["error"] }],
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "sort-imports-es6-autofix/sort-imports-es6": [
      2,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
  },
  parserOptions: {
    parser: "babel-eslint",
  },
  globals: {
    workbox: true,
  },
};
