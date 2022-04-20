import { wrapSelection, indentAtSelection } from '@laws-africa/indigo-akn';

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
    this.toggleWrapSelection(editor, this.editSource, 'format.bold', '**');
    editor.pushUndoStop();
  }

  formatItalic (editor) {
    editor.pushUndoStop();
    this.toggleWrapSelection(editor, this.editSource, 'format.italic', '//');
    editor.pushUndoStop();
  }

  formatUnderline (editor) {
    editor.pushUndoStop();
    this.toggleWrapSelection(editor, this.editSource, 'format.underline', '__');
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
   * Toggle between wrapping the selection with a symmetrical marker, and removing it. Returns the updated range.
   *
   * @returns {monaco.Range}
   */
  toggleWrapSelection (editor, edit_source, id, marker) {
    const sel = editor.getSelection();
    const model = editor.getModel();
    let newSelection = null;

    // handle multiple lines of selection
    for (let lineNumber = sel.startLineNumber; lineNumber <= sel.endLineNumber; lineNumber++) {
      const line = model.getLineContent(lineNumber);

      // range to mutate on this line
      let range = new monaco.Range(
        lineNumber, lineNumber === sel.startLineNumber ? sel.startColumn : model.getLineFirstNonWhitespaceColumn(lineNumber),
        lineNumber, lineNumber === sel.endLineNumber ? sel.endColumn : line.length + 1);

      range = this.toggleWrapSelectionOnLine(editor, edit_source, id, marker, range);
      newSelection = newSelection ? newSelection.plusRange(range) : range;
    }

    editor.setSelection(newSelection);
  }

  /**
   * Toggle between wrapping a range on a line with a symmetrical marker, and removing it. Returns the updated range.
   *
   * The following rules apply:
   *
   * 1. if the selection is wholly within a range, split the range
   * 2. if the selection is wholly outside a range, wrap (or combine adjacent ranges, if necessary)
   * 3. if the selection covers either a starting wrap or an ending wrap, then fully wrap the selection
   *
   * @param editor monaco editor instance
   * @param edit_source source of the edits
   * @param id id of the edits
   * @param marker text to use as both pre and post marker
   * @param range the range to toggle
   *
   * @returns {monaco.Range}
   */
  toggleWrapSelectionOnLine (editor, edit_source, id, marker, range) {
    const line = editor.getModel().getLineContent(range.startLineNumber);
    const ranges = this.getMarkedInlineRanges(line, marker, range.startLineNumber);

    // expand the range if necessary to cover markers
    range = this.normaliseRange(range, ranges, marker.length, marker.length);

    // is the selection exactly a range?
    if (ranges.some(r => range.equalsRange(r))) {
      // remove the range by unwrapping
      return this.unwrapRange(range, editor, edit_source, id, marker, marker);
    }

    // is the selection entirely outside all ranges?
    if (ranges.length === 0 || ranges.every(r => !monaco.Range.areIntersecting(range, r))) {
      return this.wrapRange(range, editor, edit_source, id, marker, marker);
    }

    // is the selection entirely entirely inside a range?
    if (ranges.some(r => r.containsRange(range))) {
      // Wrap the selection. This works because the start and end markers are the same, so unwrapping a portion
      // inside a wrapped range is actually the same as wrapping it
      return this.wrapRange(range, editor, edit_source, id, marker, marker);
    }

    // The selection covers multiple ranges. Unwrap each individually, create a new range over the unwrapped extent,
    // then wrap the whole thing. We do it in reverse so that we don't need to adjust ranges too much as they are
    // unwrapped (since the text changes).
    let newRange = null;
    for (let r of ranges.reverse()) {
      if (monaco.Range.areIntersectingOrTouching(r, range)) {
        r = this.unwrapRange(r, editor, edit_source, id, marker, marker);

        if (newRange) {
          // shrink down the top of the new range, to take into account that two markers have been deleted
          newRange = newRange.plusRange(r);
          newRange = newRange.setEndPosition(newRange.endLineNumber, newRange.endColumn - marker.length * 2);
        } else {
          newRange = r;
        }
      }
    }
    return this.wrapRange(newRange, editor, edit_source, id, marker, marker);
  }

  /**
   * Expand a range if it's at the edges of an existing range, or is an empty range inside an existing range.
   * @param range range to check
   * @param ranges ranges to compare with
   * @param startTolerance tolerance for distance from start (inside range)
   * @param endTolerance tolerance for distance from end (inside range)
   *
   * @returns {monaco.Range}
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
    // map indexes to ranges
    // we delegate to a simpler function which we can test without needing monaco.Ranges installed
    return this.getMarkedInlineIndexes(line, marker).map(([start, end]) => {
      // range columns start at 1, and the end column is excluded
      return new monaco.Range(lineNumber, start + 1, lineNumber, end + 2);
    });
  }

  getMarkedInlineIndexes (line, marker) {
    const pairs = [];
    const indexes = [];
    let ix = line.indexOf(marker);

    // find all occurrences
    while (ix > -1) {
      indexes.push(ix);
      ix = line.indexOf(marker, ix + marker.length);
    }

    // group into pairs
    for (let i = 0; i < indexes.length - 1; i += 2) {
      pairs.push([indexes[i], indexes[i + 1] + marker.length - 1]);
    }

    return pairs;
  }

  /**
   * Removes the pre and post markers from the given range, and updates the cursor to cover the updated text.
   * Returns the updated cursor selection.
   *
   * @returns {monaco.Range}
   */
  unwrapRange (range, editor, edit_source, id, pre, post) {
    // strip pre and post
    const text = editor.getModel().getValueInRange(range).slice(pre.length, -post.length);
    const op = {
      identifier: id,
      range: range,
      text: text,
    };
    const cursor = new monaco.Selection(
      range.startLineNumber, range.startColumn,
      range.endLineNumber, range.endColumn - pre.length - post.length);
    editor.executeEdits(edit_source, [op], [cursor]);
    return cursor;
  }

  /**
   * Wraps a range with pre and post markers, and updates the cursor to cover the updated text.
   * Returns the updated cursor selection.
   *
   * @returns {monaco.Range}
   */
  wrapRange (range, editor, edit_source, id, pre, post) {
    const text = editor.getModel().getValueInRange(range);
    const op = {
      identifier: id,
      range: range,
      text: pre + text + post
    };
    let cursor;

    if (text.length === 0) {
      // put cursor inside tags
      cursor = new monaco.Selection(
        range.startLineNumber, range.startColumn + pre.length,
        range.startLineNumber, range.startColumn + pre.length);
    } else {
      // extend selection
      cursor = new monaco.Selection(
        range.startLineNumber, range.startColumn,
        range.endLineNumber, range.startColumn + pre.length + text.length + post.length);
    }

    editor.executeEdits(edit_source, [op], [cursor]);
    return cursor;
  }
}

/**
 * Install common editor actions onto this monaco editor instance.
 */
export function installActions (editor) {
  new BluebellActions().installActions(editor);
}
