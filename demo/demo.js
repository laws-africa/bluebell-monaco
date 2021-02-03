import { registerLanguage, LANGUAGE_ID, THEME_ID, installActions } from "../index.js";

// tell monaco where to load its files from
window.require = {
  paths: {
    vs: 'monaco',
  }
};

function waitForMonaco () {
  return new Promise(resolve => {
    function check () {
      if (window.monaco) {
        resolve();
      } else {
        setTimeout(check, 500);
      }
    }

    setTimeout(check, 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  waitForMonaco().then(() => {
    registerLanguage();

    const editor = monaco.editor.create(document.getElementById('editor'), {
      value: `
PART 1 - Heading

  SECTION 1. The beginning
  
    ITEMS
      ITEM (a)
        some text
`,
      language: LANGUAGE_ID,
      theme: THEME_ID
    });
    installActions(editor);
  })
});
