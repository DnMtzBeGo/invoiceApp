# CarriersDashboard

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.2.5.

## Install dependencies

Run `npm install`. Check version dependencies for incompatibilities. Do not run audit fix unless approved.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

For low memory machines, run `npm run low` script to increase the memory limit.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Formatting

The code is formatted using [Prettier](https://prettier.io/) and default configured to serve as the fix tool for Eslint. The configuration can be found in the `.prettierrc` file.

## Linting

Linting rules exist in this project to ensure code quality. Rules can be found in the `.eslintrc.json` file. More linting rules can be implemented in the future, a useful documentation to achieve this can be found in the following links:

- [Eslint core rules](https://eslint.org/docs/latest/rules/)
- [Angular eslint plugin](https://github.com/angular-eslint/angular-eslint/tree/v12.7.0)
- [Typescript eslint plugin](https://typescript-eslint.io/rules/)
- [Jest eslint plugin](https://github.com/jest-community/eslint-plugin-jest)

To lint the project run `npx eslint [PATH]` where PATH is the path to the file or directory to be linted. To fix linting errors run `npx eslint --fix [PATH]`. If no PATH is declare, eslint will lint the hole project. More information of the linter CLI on [Eslint CLI](https://eslint.org/docs/latest/use/command-line-interface).

For automatic linting on your IDE/Text editor, install the Eslint plugin, some popular ones are:  [VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [Sublime](https://packagecontrol.io/packages/SublimeLinter-eslint), [NeoVim](https://github.com/dense-analysis/ale), if this is not one of your options, check the [Eslint integrations](https://eslint.org/docs/latest/use/integrations) page for more options.

> Why not `ng lint`? Fair question, the reason is that eslint cli give us more granular control over the linting process, allowing us to lint only the files we want and not the whole project.

***IMPORTANT: Pull Request with linting errors will not be approved. Warnings may, or may not, depend on reviewers' consideration.***

## Testing

Testing suite for Dashboard project is based on [Jest](https://jestjs.io/). Configuration can be found in the `jest.config.js` file. Test is mandatory in order to prevent errors.

To test the project run `npx jest [PATH]` where PATH is the path to the specific testing filenames or patterns. If no PATH is declare, all project test will run. The command `npx jest -o` runs tests related to changed files based on git/gh (changes in current commit). To generate a coverage report, previous scripts can work adding coverage flag, a useful example can be the follow `npx jest --coverage [PATH] && open coverage/lcov-report/index.html`. An important note on this is that jest consider all related modules to generate reports and perform test, so even if the suit fails, check the specific test output of the fieles you do want to test. More information can be found on [Jest CLI docs](https://eslint.org/docs/latest/use/command-line-interface).

> Why not `ng tests`? Fair question, Angular uses by default Karma + Jasmine test suite, but we decided that jest offers some advantages that make it a better testing option, some of them are: runs test without a browser, is several times faster, provides rich cli options, among others.

***IMPORTANT: It is the responsibility of each author to test the incoming code. Pull Requests that either do not come in properly tested or their tests do not pass will not be approved.***

## Chat

Operations can use the following keywords inside Front chat:

`#close: Closes a ticket.`
`#forward: Sends the conversation to the user's email.`

## AWS Pipeline

When merging a pull request or pushing code to development, an AWS pipeline will run to deploy the project to <https://carriers-dev.bego.ai>. The same is true for the master branch, and the production build will end up on <https://carriers.bego.ai>.
