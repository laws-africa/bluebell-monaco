import { wrapSelection } from '@laws-africa/indigo-akn';

export class BluebellActions {
  constructor() {
    this.editSource = 'bluebell';
  }

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
      id: 'format.underline',
      label: 'Underline',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_U],
      run: this.formatUnderline.bind(this)
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
    editor.pushUndoStop();
    wrapSelection(editor, this.editSource, 'format.bold', '**', '**');
    editor.pushUndoStop();
  }

  formatItalic (editor) {
    editor.pushUndoStop();
    wrapSelection(editor, this.editSource, 'format.italic', '//', '//');
    editor.pushUndoStop();
  }

  formatUnderline (editor) {
    editor.pushUndoStop();
    wrapSelection(editor, this.editSource, 'format.underline', '__', '__');
    editor.pushUndoStop();
  }

  formatSuperscript (editor) {
    editor.pushUndoStop();
    wrapSelection(editor, this.editSource, 'format.superscript', '{{^', '}}');
    editor.pushUndoStop();
  }

  formatSubscript (editor) {
    editor.pushUndoStop();
    wrapSelection(editor, this.editSource, 'format.subscript', '{{_', '}}');
    editor.pushUndoStop();
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
    editor.pushUndoStop();
    editor.executeEdits(this.editSource, [marker]);

    // this edit will add the footnote content
    const indent = ' '.repeat(indentAtSelection(editor, sel));

    const content = {
      identifier: 'insert.footnote',
      range: {
        startColumn: model.getLineLength(sel.endLineNumber) + 1,
        startLineNumber: sel.endLineNumber
      },
      text: '\n\n' + indent + 'FOOTNOTE 1\n' + indent + '  ' + text
    };
    content.range.endColumn = content.range.startColumn;
    content.range.endLineNumber = content.range.startLineNumber;

    // where the cursor ends up
    const newlines = 3;
    const cursor = new window.monaco.Selection(
      content.range.startLineNumber + newlines,
      indent.length + 3,
      content.range.startLineNumber + newlines,
      indent.length + 3 + text.length);

    editor.executeEdits(this.editSource, [content], [cursor]);
    editor.pushUndoStop();
  }

  insertTable (editor) {
    const sel = editor.getSelection();
    const indent = ' '.repeat(indentAtSelection(editor, sel));

    editor.pushUndoStop();
    editor.executeEdits(this.editSource, [{
      identifier: 'insert.table',
      range: sel,
      text: 'TABLE\n\n' + indent + ' TR\n\n' + indent + '   TH\n\n' + indent + '     Heading 1\n\n' + indent + '   TH\n\n' + indent + '     Heading 2\n\n' + indent + ' TR\n\n' + indent + '   TC\n\n' + indent + '     Content 1\n\n' + indent + '   TC\n' + indent + '     Content 2'
    }]);
    editor.pushUndoStop();
  }
}

/**
 * Install common editor actions onto this monaco editor instance.
 */
export function installActions (editor) {
  new BluebellActions().installActions(editor);
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
