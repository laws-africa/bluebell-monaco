export const LANGUAGE_ID = 'bluebell';

export const LANGUAGE_DEF = {
  defaultToken: '',
  hier: /ALINEA|ART|ARTICLE|BOOK|CHAP|CHAPTER|CLAUSE|DIVISION|INDENT|LEVEL|LIST|PARA|PARAGRAPH|PART|POINT|PROVISO|RULE|SEC|SECTION|SUBCHAP|SUBCHAPTER|SUBCLAUSE|SUBDIVISION|SUBLIST|SUBPARA|SUBPARAGRAPH|SUBPART|SUBRULE|SUBSEC|SUBSECTION|SUBTITLE|TITLE|TOME|TRANSITIONAL/,
  blocks: /QUOTE/,
  markers: /PREFACE|PREAMBLE|INTRODUCTION|BACKGROUND|ARGUMENTS|REMEDIES|MOTIVATION|DECISION|CONCLUSIONS|BODY/,
  headings: /LONGTITLE|CROSSHEADING|SUBHEADING/,
  tokenizer: {
    root: [

      // grouping markers
      [/^\s*@markers\s*$/, 'keyword.marker'],

      // blocks
      [/^\s*@blocks\s*$/, 'keyword.marker'],

      // single line headings
      [/^(\s*)(@headings)(\s.*)$/, ['white', 'keyword.heading', 'string']],

      // hierarchical
      // PARA
      [/^\s*@hier\s*$/, 'keyword.hier'],
      // PARA - heading
      [/^(\s*)(@hier)(\s+-\s+)(.*$)/, ['white', 'keyword.hier', 'delimiter', 'string']],
      // PARA num - heading
      [/^(\s*)(@hier)(\s+.+)(-)(\s+.*$)/, ['white', 'keyword.hier', 'number', 'delimiter', 'string']],
      // PARA num
      [/^(\s*)(@hier)(\s+.+$)/, ['white', 'keyword.hier', 'number']],

      // attachments
      [/\s*(ATTACHMENT|APPENDIX|SCHEDULE|ANNEXURE)\b/, 'keyword.attachment'],

      // inlines
      [/\*\*.*?\*\*/, 'inline.bold'],
      [/\/\/.*?\/\//, 'inline.italic'],
      [/{{\^.*?}}/, 'inline.superscript'],
      [/{{_.*?}}/, 'inline.subscript'],
      [/{{>.*?}}/, 'inline.ref'],

      [/[{}[\]()]/, '@brackets']
    ]
  }
};

export const THEME_ID = 'bluebell';

export const THEME_DEF = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'string', foreground: '008000' },
    { token: 'number', foreground: 'C800A4' },
    { token: 'inline.bold', fontStyle: 'bold' },
    { token: 'inline.italic', fontStyle: 'italic' },
    { token: 'inline.ref', fontStyle: 'underline', foreground: 'ffa500' },
    { token: 'inline.underline', fontStyle: 'text-decoration: underline' }
  ]
};

/**
 * Register bluebell language and theme support with Monaco.
 */
export function registerLanguage () {
  const monaco = window.monaco;

  monaco.languages.register({id: LANGUAGE_ID});
  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, LANGUAGE_DEF);
  monaco.editor.defineTheme(THEME_ID, THEME_DEF);
};
