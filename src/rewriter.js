export class EidRewriter {
  constructor () {
    this.idUnnecessary = [
      'arguments', 'background', 'conclusions', 'decision', 'header', 'introduction', 'motivation', 'preamble', 'preface', 'remedies'
    ];
    this.numExpected = [
      'alinea', 'article', 'book', 'chapter', 'clause', 'division', 'indent', 'item', 'level', 'list', 'paragraph', 'part', 'point', 'proviso', 'rule', 'section', 'subchapter', 'subclause', 'subdivision', 'sublist', 'subparagraph', 'subpart', 'subrule', 'subsection', 'subtitle', 'title', 'tome', 'transitional'
    ];
    // leading whitespace and punctuation
    this.leadingPunctRe = /^[\s\u2000-\u206f\u2e00-\u2e7f!"#$%&'()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/g;
    // trailing whitespace and punctuation
    this.trailingPunctRe = /[\s\u2000-\u206f\u2e00-\u2e7f!"#$%&'()*+,\-.\/:;<=>?@\[\]^_`{|}~]+$/g;
    // whitespace
    this.whitespaceRe = /\s/g;
    // general punctuation
    this.punctRe = /[\u2000-\u206f\u2e00-\u2e7f!"#$%&'()*+,\-.\/:;<=>?@\[\]^_`{|}~]+/g;
    this.elementAliases = {
      'alinea': 'al',
      'amendmentBody': 'body',
      'article': 'art',
      'attachment': 'att',
      'blockList': 'list',
      'chapter': 'chp',
      'citation': 'cit',
      'citations': 'cits',
      'clause': 'cl',
      'component': 'cmp',
      'components': 'cmpnts',
      'componentRef': 'cref',
      'debateBody': 'body',
      'debateSection': 'dbsect',
      'division': 'dvs',
      'documentRef': 'dref',
      'eventRef': 'eref',
      'judgmentBody': 'body',
      'listIntroduction': 'intro',
      'listWrapUp': 'wrapup',
      'mainBody': 'body',
      'paragraph': 'para',
      'quotedStructure': 'qstr',
      'quotedText': 'qtext',
      'recital': 'rec',
      'recitals': 'recs',
      'section': 'sec',
      'subchapter': 'subchp',
      'subclause': 'subcl',
      'subdivision': 'subdvs',
      'subparagraph': 'subpara',
      'subsection': 'subsec',
      'temporalGroup': 'tmpg',
      'wrapUp': 'wrapup',
    };
    this.idUnnecessaryButPassToChildren = ['intro', 'wrapUp'];
  }

  /** Rewrites the eIds for all nodes in the tree.
   */
  rewriteAllEids (xmlDocument) {
    this.counters = {};
    this.eIdCounter = {};

    for (let i = 0; i < xmlDocument.children.length; i++) {
      // use empty string as prefix to start
      this.rewriteElement(xmlDocument.children[i], '');
    }
  }

  rewriteElement (element, prefix) {
    // skip meta blocks
    if (element.tagName !== 'meta') {
      let oldEid = element.getAttribute('eId'),
          newEid = '';

      // only recalculates existing eIds instead of checking if the element should have one first
      if (oldEid) {
        // use preface / preamble as prefix
        if (element.parentElement.tagName === 'preface' || element.parentElement.tagName === 'preamble') {
          prefix = element.parentElement.tagName;
        }

        newEid = this.getEid(element, prefix);

        // only rewrites eIds (and their children) that have changed
        if (oldEid !== newEid) {
          this.rewriteEids(element, oldEid, newEid);
        }
      }

      // keep drilling down
      // (use the new eId as the prefix if there is one, or default to the parent;
      // include the current tag in the prefix if needed)
      prefix = newEid || prefix;
      if (this.idUnnecessaryButPassToChildren.includes(element.tagName)) {
        prefix = `${prefix}__${element.tagName.toLowerCase()}`;
      }
      for (let i = 0; i < element.children.length; i++) {
        this.rewriteElement(element.children[i], prefix)
      }
    }
  }

  /** Generates a unique eId based on the element tag and its num contents (if any).
   */
  getEid (element, prefix) {
    let name = element.tagName,
        shortName = this.elementAliases[element.tagName] || name,
        num = (element.firstElementChild && element.firstElementChild.tagName === 'num') ? element.firstElementChild.textContent: '',
        eId = (prefix) ? `${prefix}__${shortName}`: shortName,
        nn = false;
    if (!this.idUnnecessary.includes(name)) {
      num = this.cleanNum(num);

      // use e.g. paragraph_nn for unnumbered elements that usually have a num
      if (num === '' && this.numExpected.includes(name)) {
        num = 'nn';
        nn = true;
      }

      // use e.g. hcontainer_1 for unnumbered elements where a num isn't expected
      if (num === '') {
        let counter = this.counters[prefix] || (this.counters[prefix] = {}),
            count = counter[name] || 0;

        num = counter[name] = count + 1;
      }

      eId = this.ensureUnique(`${eId}_${num}`, nn);
    }
    return eId;
  }

  /**
   * Clean a <num> value for use in an eId
   * See https://docs.oasis-open.org/legaldocml/akn-nc/v1.0/os/akn-nc-v1.0-os.html*_Toc531692306
   *
   * "The number part of the identifiers of such elements corresponds to the
   * stripping of all final punctuation, meaningless separations as well as
   * redundant characters in the content of the <num> element. The
   * representation is case-sensitive."
   *
   * Our algorithm is:
   * 1. strip all leading and trailing whitespace and punctuation (using the unicode punctuation blocks)
   * 2. strip all whitespace
   * 3. replace all remaining punctuation with a hyphen.
   *
   * The General Punctuation block is \u2000-\u206F, and the Supplemental Punctuation block is \u2E00-\u2E7F.
   *
   * (i) -> i
   * 1.2. -> 1-2
   * “2.3“ -> 2-3
   * 3a bis -> 3abis
   */
  cleanNum (num) {
    return num.replace(this.leadingPunctRe, '')
      .replace(this.trailingPunctRe, '')
      .replace(this.whitespaceRe, '')
      .replace(this.punctRe, '-');
  }

  /** Ensures a given eId is unique; adds the count to `nn` and non-unique eids.
   */
  ensureUnique (eId, nn) {
    let count = (this.eIdCounter[eId] || 0) + 1;
    this.eIdCounter[eId] = count;
    if (count === 1 && !nn) {
      return eId;
    }
    return this.ensureUnique(`${eId}_${count}`, false);
  }

  /** Updates the given element's eId as well as its children's.
   */
  rewriteEids (element, oldPrefix, newPrefix) {
    let oldEidLength = oldPrefix.length,
        oldEid = element.getAttribute('eId');

    function rewrite(elem, old) {
      if (old && old.startsWith(oldPrefix)) {
        elem.setAttribute('eId', newPrefix + old.slice(oldEidLength));
      }
    }

    function rewriteChild(child) {
      let oldEid = child.getAttribute('eId');

      rewrite(child, oldEid);

      for (let i = 0; i < child.children.length; i++) {
        rewriteChild(child.children[i]);
      }
    }

    // rewrite the main element
    rewrite(element, oldEid);

    // rewrite children recursively
    for (let i = 0; i < element.children.length; i++) {
      rewriteChild(element.children[i]);
    }
  }
}
