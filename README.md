# bluebell-monaco

Bluebell grammar support for the [Monaco Editor](https://microsoft.github.io/monaco-editor/).

* Language/syntax rules and a corresponding theme to enable syntax highlighting. Enabled with `registerLanguage()`.
* Actions for monaco to apply formatting (eg. bold, italics). Enabled with `installActions()` and triggered using `editor.trigger('...', 'format.bold')`.
* An Indigo GrammarModel for Bluebell

## Installation

Install with

```bash
npm install @laws-africa/bluebell-monaco
```

## Usage

Configure syntax highlighting by registering the language with monaco:

```js
import { registerLanguage } from "bluebell-monaco";
registerLanguage();
```

and then specify the language and theme when creating your editor:

```js
import { LANGUAGE_ID, THEME_ID } from "bluebell-monaco";

const editor = monaco.editor.create(elem, {
  language: LANGUAGE_ID,
  theme: THEME_ID
});
```

Once you have created a monaco editor instance, setup Bluebell-related edit actions like this:

```js
import { installActions } from "bluebell-monaco";
installActions(editor);

// trigger the format.bold action
editor.trigger('your-app', 'format.bold');
```

## Running tests

1. Install dependencies: `npm install`
2. Run tests: `npm test`

## Running demo

There's a small demo editor to test functionality. To use it:

1. `cd demo`
2. `npx webpack`
3. run `demo/index.html` in PyCharm to launch a webserver

## Releasing a new version

1. Make your changes.
2. Update the version in package.json, according to [semver.org](https://semver.org/)
3. Commit and push.
4. Create a new release in [GitHub releases](https://github.com/laws-africa/bluebell-monaco/releases/new)
5. Github will package the release automatically
