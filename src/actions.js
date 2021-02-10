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
    this.toggleWrapSelection(editor, this.editSource, 'format.bold', '**', '**');
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

  /**
   * Toggle between wrapping the selection with pre and post markers, and removing them.
   *
   * The following rules apply:
   *
   * 1. if the selection is wholly within a range, split the range
   * 2. if the selection is wholly outside a range, wrap (or combine adjacent ranges, if necessary)
   * 3. if the selection covers either a starting wrap or an ending wrap, then fully wrap the selection
   */
  toggleWrapSelection (editor, edit_source, id, pre, post) {
    const sel = editor.getSelection();

    // TODO: handle multiple lines?
    // monaco columns are 1-based
    let selStart = sel.startColumn - 1;
    let selEnd = Math.max(selStart, sel.endColumn - 2);
    let range = new monaco.Range(sel.startLineNumber, sel.startColumn, sel.startLineNumber, sel.endColumn);
    const line = editor.getModel().getLineContent(sel.getStartPosition().lineNumber);

    if (pre === post) {
      // markers are symmetrical, eg. **bold**
      const ranges = this.getMarkedInlineRanges(line, pre, range.startLineNumber);

      // expand the range if necessary to cover markers
      range = this.normaliseRange(range, ranges, pre.length, post.length);

      // is the selection exactly a range?
      if (ranges.some(r => range.equalsRange(r))) {
        // remove the range by unwrapping
        unwrapRange(range, editor, edit_source, id, pre, post);
        return;
      }

      // are there no other ranges, or is the selection entirely contained in a range?
      if (ranges.length === 0 || ranges.some(r => r.containsRange(range))) {
        // wholly contained - break range by wrapping
        wrapSelection(editor, edit_source, id, pre, post);
        return;
      }

      // is the selection entirely outside a range?
      for (let i = 0; i < ranges.length; i++) {
        const [start, end] = ranges[i];

        if (
          // wholly before first range
          (i === 0 && start >= selEnd) ||
          // wholly after last range
          (i === ranges.length - 1 && end <= selStart) ||
          // wholly between ranges
          (
            (end <= selStart) &&
            (i === ranges.length - 1 || ranges[i+1][0] >= selEnd)
          )
        ) {
          // wholly contained, wrap
          wrapSelection(editor, edit_source, id, pre, post);
          return;
        }
      }

      // does the selection cover either a starting wrap, or an ending wrap?

    } else {
      // markers are asymmetrical, eg {{^super}}
      // not yet supported
      wrapSelection(editor, edit_source, id, pre, post);
    }
  }

  /**
   * Expand a range if it's at the edges of an existing range, or is an empty range inside an existing range.
   * @param range range to check
   * @param ranges ranges to compare with
   * @param startTolerance tolerance for distance from start (inside range)
   * @param endTolerance tolerance for distance from end (inside range)
   */
  normaliseRange (range, ranges, startTolerance, endTolerance) {
    for (let r of ranges) {
      // if it's an empty selection within a range, expand to cover the full range
      if (range.isEmpty() && r.containsRange(range)) {
        return r;
      }

      // if the selection is within the tolerance of the edges of a range, expand it to cover the full range
      let diff = range.startColumn - r.startColumn;
      if (diff > 0 && diff <= startTolerance) {
        range = range.setStartPosition(range.startLineNumber, r.startColumn);
      }

      diff = r.endColumn - range.endColumn;
      if (diff > 0 && diff <= endTolerance) {
        range = range.setEndPosition(range.endLineNumber, r.endColumn);
      }
    }

    return range;
  }

  /**
   * Get an ordered list of Range objects, identifying inline markup in a line of text. Only supports symmetrical
   * inline markers.
   *
   * @param line a single line of text
   * @param marker start (and end) marker string to look for
   * @param lineNumber line number to use for the ranges
   */
  getMarkedInlineRanges (line, marker, lineNumber) {
    const ranges = [];
    const indexes = [];
    let ix = line.indexOf(marker);

    // find all occurrences
    while (ix > -1) {
      indexes.push(ix);
      ix = line.indexOf(marker, ix + marker.length);
    }

    // group into pairs
    for (let i = 0; i < indexes.length - 1; i += 2) {
      ranges.push(new monaco.Range(
        // columns start at 1
        lineNumber, indexes[i] + 1,
        lineNumber,indexes[i + 1] + marker.length + 1));
    }

    return ranges;
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

/**
 * Removes the pre and post markers from the given range, an updates the cursor to cover the updated text.
 */
export function unwrapRange (range, editor, edit_source, id, pre, post) {
  // strip pre and post
  const text = editor.getModel().getValueInRange(range).slice(pre.length, -post.length);
  const op = {
    identifier: id,
    range: range,
    text: text,
  };
  const cursor = new monaco.Selection(
    range.startLineNumber, range.startColumn, range.endLineNumber,
    range.endColumn - pre.length - post.length);
  editor.executeEdits(edit_source, [op], [cursor]);
}
