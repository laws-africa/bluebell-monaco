# bluebell-monaco

Bluebell grammar support for the [Monaco Editor](https://microsoft.github.io/monaco-editor/).

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
```
