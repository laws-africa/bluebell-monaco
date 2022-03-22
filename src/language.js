export const LANGUAGE_ID = 'bluebell';

export const LANGUAGE_DEF = {
  defaultToken: '',
  // ITEM is considered hier because it has the same grammar as hier markers
  hier: /ALINEA|ART|ARTICLE|BOOK|CHAP|CHAPTER|CLAUSE|DIVISION|INDENT|ITEM|LEVEL|LIST|PARA|PARAGRAPH|PART|POINT|PROVISO|RULE|SEC|SECTION|SUBCHAP|SUBCHAPTER|SUBCLAUSE|SUBDIVISION|SUBLIST|SUBPARA|SUBPARAGRAPH|SUBPART|SUBRULE|SUBSEC|SUBSECTION|SUBTITLE|TITLE|TOME|TRANSITIONAL/,
  blocks: /QUOTE|ITEMS|BLOCKLIST|BULLETS/,
  markers: /PREFACE|PREAMBLE|INTRODUCTION|BACKGROUND|ARGUMENTS|REMEDIES|MOTIVATION|DECISION|CONCLUSIONS|BODY/,
  headings: /LONGTITLE|CROSSHEADING|SUBHEADING/,
  // dotted classes for inlines
  classes: /\.[^. {}]+/,
  attrs: /{(?:[^} ]+\s+[^} ]+)*}/,
  inlines: /abbr|def|em|inline|term|\^|_|>|\+|-/,
  tables: /TABLE|TR|TH|TC/,
  tokenizer: {
    root: [

      // grouping markers
      [/^\s*@markers\s*$/, 'keyword.marker'],

      // blocks
      [/^(\s*@blocks)(@classes*)(@attrs?)(\s*)$/, ['keyword.marker', 'string', 'number', 'white']],

      // single line headings
      [/^(\s*)(@headings)(\s.*)$/, ['white', 'keyword.heading', 'string']],

      // footnote marker
      [/^(\s*)(FOOTNOTE)(\s.+)$/, ['white', 'keyword.heading', 'number']],

      // attachments
      [/\s*(ATTACHMENT|APPENDIX|SCHEDULE|ANNEXURE)\b/, 'keyword.attachment'],

      // hierarchical
      // PARA
      [/^\s*@hier\s*$/, 'keyword.hier'],
      // PARA - heading
      [/^(\s*)(@hier)(\s+-\s+)(.*$)/, ['white', 'keyword.hier', 'delimiter', 'string']],
      // PARA num - heading
      [/^(\s*)(@hier)(\s+.+)(-)(\s+.*$)/, ['white', 'keyword.hier', 'number', 'delimiter', 'string']],
      // PARA num
      [/^(\s*)(@hier)(\s+.+$)/, ['white', 'keyword.hier', 'number']],

      // P (only when it has attribs)
      [/^(\s*)(P)(@classes*)(@attrs?)(\s|$)/, ['white', 'keyword.hier', 'string', 'number', 'white']],

      // tables
      [/^(\s*)(@tables)(@classes*)(@attrs?)(\s*)$/, ['white', 'keyword.marker', 'string', 'number', 'white']],

      {include: '@inlines'},

      [/[{}[\]()]/, '@brackets']
    ],

    inlines: [
      // specifically-styled inlines
      [/}}/, 'keyword', '@pop'],
      [/\*\*/, 'inline.bold', '@bold'],
      [/\/\//, 'inline.italic', '@italic'],
      [/__/, 'inline.underline', '@underline'],
      // remarks
      [/({{\*)(@classes*)(@attrs?)/, ['keyword', 'string', {token: 'number', next: '@remark'}]],
      // links
      [/({{>)(@classes*)(@attrs?)([^ ]*)/, ['keyword', 'string', 'number', {token: 'inline.link', next: '@inlines'}]],

      // generic nested inlines
      [/({{@inlines)(@classes*)(@attrs?)/, ['keyword', 'string', {token: 'number', next: '@inlines'}]],
    ],

    remark: [
      [/}}/, 'keyword', '@pop'],
      {include: '@inlines'},
      [/./, 'comment.remark']
    ],

    bold: [
      [/\*\*/, 'inline.bold', '@pop'],
      {include: '@inlines'},
      [/./, 'inline.bold'],
    ],

    italic: [
      [/\/\//, 'inline.italic', '@pop'],
      {include: '@inlines'},
      [/./, 'inline.italic'],
    ],

    underline: [
      [/__/, 'inline.underline', '@pop'],
      {include: '@inlines'},
      [/./, 'inline.underline'],
    ],
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
    { token: 'inline.underline', fontStyle: 'underline' },
    { token: 'inline.link', fontStyle: 'underline' },
    { token: 'comment.remark', fontStyle: 'italic' },
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
}
