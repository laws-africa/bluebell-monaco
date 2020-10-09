import { GrammarModel } from "@laws-africa/indigo-akn";
import { LANGUAGE_ID, registerLanguage, THEME_ID } from "./language";
import { installActions } from "./actions";

/**
 * Grammar model for Bluebell and monaco.
 */
class BluebellGrammarModel extends GrammarModel {
  constructor (...args) {
    super(...args);

    this.language_id = LANGUAGE_ID;
    this.theme_id = THEME_ID;
    this.image_re = /{{IMG ([^ ]+)(\s+((?!}}).)*)?}}/g;
  }

  installLanguage () {
    registerLanguage();
  }

  installActions (editor) {
    installActions(editor);
  }

  /**
   * Markup a textual remark
   */
  markupRemark (text) {
    return `[[${text}]]`;
  }

  /**
   * Markup a link (ref)
   */
  markupRef (title, href) {
    return `{{>${href} ${title}}}`;
  }

  markupImage (title, src) {
    return `{{IMG ${src}` + (title ? ` ${title}` : '');
  }

  getImageAtCursor (editor) {
    const match = super.getImageAtCursor(editor);
    if (match) {
      match.title = match.match[2].strip();
      match.src = match.match[1];
    }
    return match;
  }
}
