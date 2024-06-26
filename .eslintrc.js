module.exports = {
  root: true,
  ignorePatterns: ["projects/**/*"],
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: __dirname + "/tsconfig.json",
        createDefaultProgram: true
      },
      extends: [
        "plugin:import/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:prettier/recommended"
      ],
      rules: {
        "@angular-eslint/component-class-suffix": [
          "error",
          {
            suffixes: ["Page", "Component"]
          }
        ],
        "@angular-eslint/directive-selector": [
          "error",
          {
            type: "attribute",
            prefix: "app",
            style: "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            type: "element",
            prefix: "app",
            style: "kebab-case"
          }
        ],
        "import/named": "off",
        "import/first": "error",
        "import/no-unused-modules": "error",
        "import/newline-after-import": "error",
        "import/no-duplicates": "error",
        "import/order": [
          "error",
          {
            groups: [
              ["builtin", "external"],
              ["internal", "parent", "sibling", "index"]
            ],
            "newlines-between": "always"
          }
        ],
        "no-restricted-imports": [
          "warn",
          {
            patterns: [
              {
                group: ["..*"]
              },
              {
                group: ["*.service", "*.component", "*.module", "*.pipe", "*.directive", "*.guard", "*.interceptor"],
                message: "Please do not use the specific file import. Use the index export file instead. Fix this by removing the file name from the import statement. If the index export file does not exist, create it and export the file from there."
              }
            ]
          }
        ],
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          {
            overrides: { constructors: "no-public" }
          }
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "@typescript-eslint/typedef": [
          "warn",
          {
            memberVariableDeclaration: true,
            propertyDeclaration: true
          }
        ],
        "@typescript-eslint/naming-convention": [
          "error",
          {
            selector: "typeLike",
            format: ["PascalCase"]
          }
        ]
      }
    },
    {
      files: ["*.html"],
      excludedFiles: ["*inline-template-*.component.html"],
      extends: ["plugin:@angular-eslint/template/recommended", "plugin:prettier/recommended"],
      rules: {
        "prettier/prettier": ["error", { parser: "angular" }]
      }
    },
    {
      files: ["index.ts", "*-test.js"],
      rules: {
        "no-restricted-imports": "off"
      }
    },
    {
      files: ["*.module.ts"],
      rules: {
        "no-restricted-imports": [ "warn", { patterns: [ { group: [ "..*" ] } ] } ],
      }
    },
    {
      files: ["*.spec.ts"],
      plugins: ["jest"],
      env: {
        "jest/globals": true
      },
      extends: ["plugin:jest/recommended", "plugin:jest/style"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["..*"]
              },
              {
                group: ["!*.service", "!*.component", "!*.module", "!*.pipe", "!*.directive", "!*.guard", "!*.interceptor"],
                message: "Please use the specific file name on import. Since this is a unit test, only the file to be tested should be imported. This is important as Jest attempts to resolve all imported dependencies in the index file."
              }
            ]
          }
        ],
      }
    }
  ],
  settings: {
    "import/resolver": {
      typescript: {} // this loads <rootdir>/tsconfig.json to eslint
    }
  }
};
