module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
      "no-mixed-spaces-and-tabs": "warn",
      "no-irregular-whitespace": "warn",
      "no-self-assign": "warn",
      "no-empty": "warn",
      "@typescript-eslint/ban-types": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "no-var": "warn",
      "prefer-const": "warn"
    }
};
