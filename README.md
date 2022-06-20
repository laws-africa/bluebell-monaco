# bluebell-monaco

Bluebell grammar support for the [Monaco Editor](https://microsoft.github.io/monaco-editor/).

* Language/syntax rules and a corresponding theme to enable syntax highlighting. Enabled with `registerLanguage()`.
* Actions for monaco to apply formatting (eg. bold, italics). Enabled with `installActions()` and triggered using `editor.trigger('...', 'format.bold')`.
* An Indigo GrammarModel for Bluebell

This repo's AKN-to-text XSLT is automatically updated when
[`bluebell/akn_text.xsl`](https://github.com/laws-africa/bluebell/blob/master/bluebell/akn_text.xsl) is updated in the
Bluebell repo.

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

# License

Copyright 2020 Laws.Africa.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
