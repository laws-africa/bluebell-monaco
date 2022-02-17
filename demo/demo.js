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
SEC 1. - Definitions
  SUBHEADING subheading

  Normal text

  P.classname{attr value} text with {{term{refersTo #term-fun} fun}} inlines;

  {{^ superscript allows nested **bold** {{^higher}} inlines}}

  QUOTE{startQuote "}
    A quote with //italics// and __underline__.
  
  URLs in links should be underlined: {{>foo bar}}

  {{*[remarks must be green and italics and allow nested {{>/akn/na/act/1987/5 5 of 1987}} links]}}

  TABLE
    TR{rowSpan 2}
      TH.text-right{colSpan 1}
        heading
      TC
        cell

ARTICLE 2.

  SUBPARA - Number but no heading

  The below should NOT highlight since they're not valid

  TABLE some text
  QUOTE xx
  PREFACE xxx
`,
      language: LANGUAGE_ID,
      theme: THEME_ID
    });
    installActions(editor);

    // bind buttons
    for (let btn of document.querySelectorAll('.actions button[data-action]')) {
      btn.addEventListener('click', e => {
        editor.trigger('bluebell-monaco', btn.getAttribute('data-action'));
        editor.focus();
      });
    }
  })
});
