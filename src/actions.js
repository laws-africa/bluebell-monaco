export class BluebellActions {
  constructor() {
    this.editSource = 'bluebell';
  }

  /**
   * Install common editor actions onto this monaco editor instance.
   */
  installActions (editor) {
    const monaco = window.monaco;

    editor.addAction({
      id: 'format.bold',
      label: 'Bold',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B],
      run: this.formatBold.bind(this)
    });
    editor.addAction({
      id: 'format.italic',
      label: 'Italic',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_I],
      run: this.formatItalic.bind(this)
    });
    editor.addAction({
      id: 'format.superscript',
      label: 'Superscript',
      run: this.formatSuperscript.bind(this)
    });
    editor.addAction({
      id: 'format.subscript',
      label: 'Subscript',
      run: this.formatSubscript.bind(this)
    });
    editor.addAction({
      id: 'insert.footnote',
      label: 'Insert footnote',
      run: this.insertFootnote.bind(this)
    });
    editor.addAction({
      id: 'insert.table',
      label: 'Insert table',
      run: this.insertTable.bind(this)
    });
  }

  formatBold (editor) {
    wrapSelection(editor, this.editSource, 'format.bold', '**', '**');
  }

  formatItalic (editor) {
    wrapSelection(editor, this.editSource, 'format.italic', '//', '//');
  }

  formatSuperscript (editor) {
    wrapSelection(editor, this.editSource, 'format.superscript', '{{^', '}}');
  }

  formatSubscript (editor) {
    wrapSelection(editor, this.editSource, 'format.subscript', '{{_', '}}');
  }

  insertFootnote (editor) {
    const sel = editor.getSelection();
    const model = editor.getModel();
    // this is the body of the footnote, if any text is selected
    const text = model.getValueInRange(sel);

    // this edit inserts the marker at the current cursor position, replacing any selected text
    const marker = {
      identifier: 'insert.footnote',
      range: sel,
      text: '{{^{{FOOTNOTE 1}}}}'
    };
    editor.executeEdits(this.editSource, [marker]);

    // this edit will add the footnote content
    const indent = ' '.repeat(indentAtSelection(editor, sel));

    const content = {
      identifier: 'insert.footnote',
      range: {
        startColumn: model.getLineLength(sel.endLineNumber) + 1,
        startLineNumber: sel.endLineNumber
      },
      text: '\n\n' + indent + 'FOOTNOTE 1\n\n' + indent + '  ' + text
    };
    content.range.endColumn = content.range.startColumn;
    content.range.endLineNumber = content.range.startLineNumber;

    // where the cursor ends up
    const newlines = 4;
    const cursor = new window.monaco.Selection(
      content.range.startLineNumber + newlines,
      indent.length + 3,
      content.range.startLineNumber + newlines,
      indent.length + 3 + text.length);

    editor.executeEdits(this.editSource, [content], [cursor]);
  }

  insertTable (editor) {
    const sel = editor.getSelection();
    const indent = ' '.repeat(indentAtSelection(editor, sel));

    editor.executeEdits(this.editSource, [{
      identifier: 'insert.table',
      range: sel,
      text: 'TABLE\n\n' + indent + ' TR\n\n' + indent + '   TH\n\n' + indent + '     Heading 1\n\n' + indent + '   TH\n\n' + indent + '     Heading 2\n\n' + indent + ' TR\n\n' + indent + '   TC\n\n' + indent + '     Content 1\n\n' + indent + '   TC\n' + indent + '     Content 2'
    }]);
  }
}

/**
 * Wrap the current selection of the editor in pre and post text.
 * Expands the selection if there is selected text, or moves
 * the selection between pre and post if there is nothing selected.
 */
export function wrapSelection (editor, source, id, pre, post) {
  const sel = editor.getSelection();
  const text = editor.getModel().getValueInRange(sel);
  const op = {
    identifier: id,
    range: sel,
    text: pre + text + post
  };
  // either extend the selection, or place cursor inside the tags
  const cursor = text.length === 0
    ? sel.setEndPosition(sel.startLineNumber, sel.startColumn + pre.length)
      .setStartPosition(sel.startLineNumber, sel.startColumn + pre.length)
    : sel.setEndPosition(sel.endLineNumber, sel.endColumn + 4);
  editor.executeEdits(source, [op], [cursor]);
}

/**
 * Returns the size of the indent, in spaces, at the given selection
 */
export function indentAtSelection (editor, sel) {
  // indent is either the first non-whitespace character on the current line (ie. the indent of this line),
  // or where the cursor is if there's no text on this line
  let indent = editor.getModel().getLineFirstNonWhitespaceColumn(sel.startLineNumber) - 1;
  if (indent < 0) {
    indent = sel.startColumn;
  }
  return indent;
}
