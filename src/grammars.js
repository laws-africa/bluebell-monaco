import { GrammarModel } from "@laws-africa/indigo-akn";
import { LANGUAGE_ID, registerLanguage, THEME_ID } from "./language";
import { installActions } from "./actions";
import { AKN_TO_TEXT } from "./xslt";

/**
 * Grammar model for Bluebell and monaco.
 */
export class BluebellGrammarModel extends GrammarModel {
  constructor (...args) {
    super(...args);

    this.language_id = LANGUAGE_ID;
    this.theme_id = THEME_ID;
    this.image_re = /{{IMG ([^ ]+)(\s+((?!}}).)*)?}}/g;
  }

  setup () {
    const xml = new DOMParser().parseFromString(AKN_TO_TEXT, 'text/xml');
    this.textTransform = new XSLTProcessor();
    this.textTransform.importStylesheet(xml);
    // return immediately resolved promise
    return new Promise(resolve => resolve());
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
    return `{{IMG ${src}` + (title ? ` ${title}` : '') + '}}';
  }

  getImageAtCursor (editor) {
    const match = super.getImageAtCursor(editor);
    if (match) {
      match.title = (match.match[2] || '').trim();
      match.src = match.match[1];
    }
    return match;
  }
}
