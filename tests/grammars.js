import { expect } from 'chai';
import { BluebellGrammarModel } from "../src/grammars";

describe('BluebellGrammarModel', () => {
  describe('#xmlToText()', () => {
    it('should unparse xml correctly', () => {
      const xml = `<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <statement>
    <mainBody>
      <p eId="p_1"><i>The Conference of Parties,</i></p>
      <division eId="dvs_A">
        <num>A.</num>
        <heading>Cooperation with other conventions</heading>
        <intro>
          <p eId="dvs_A__p_1"><i>Noting</i> the report of the Executive Secretary on progress,<sup><authorialNote marker="1" placement="bottom" eId="dvs_A__p_1__authorialNote_1"><p eId="dvs_A__p_1__authorialNote_1__p_1">UNEP/CBD/COP/12/24.</p></authorialNote></sup></p>
          <p eId="dvs_A__p_2"><i>Recalling</i> decision XI/6, including paragraph 3, in which it urged Parties to pursue efforts to enhance synergies among the biodiversity-related conventions to promote policy coherence, improve efficiency and enhance coordination and cooperation at all levels, and with a view to strengthening Parties’ ownership of the process,</p>
        </intro>
        <paragraph eId="dvs_A__para_1">
          <num>1.</num>
          <content>
            <p eId="dvs_A__para_1__p_1"><i>Welcomes</i> the International Plant Protection Convention as a member of the Liaison Group of the Biodiversity-related Conventions and <i>notes</i> with appreciation the role of the International Plant Protection Convention in helping to achieve Aichi Biodiversity Target 9;</p>
          </content>
        </paragraph>
      </division>
    </mainBody>
  </statement>
</akomaNtoso>`;

      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const grammar = new BluebellGrammarModel();
      grammar.setup();
      expect(grammar.xmlToText(doc)).to.equal(`//The Conference of Parties,//

DIVISION A. - Cooperation with other conventions

  //Noting// the report of the Executive Secretary on progress,{{^{{FOOTNOTE 1}}}}

  FOOTNOTE 1

    UNEP/CBD/COP/12/24.

  //Recalling// decision XI/6, including paragraph 3, in which it urged Parties to pursue efforts to enhance synergies among the biodiversity-related conventions to promote policy coherence, improve efficiency and enhance coordination and cooperation at all levels, and with a view to strengthening Parties’ ownership of the process,

  PARA 1.

    //Welcomes// the International Plant Protection Convention as a member of the Liaison Group of the Biodiversity-related Conventions and //notes// with appreciation the role of the International Plant Protection Convention in helping to achieve Aichi Biodiversity Target 9;
`);
    });

    it('should escape when unparsing', () => {
      const xml = `<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
      <statement>
        <mainBody>
          <p>PART</p>
          <p>a plain \\ backslash</p>
          <p>some **text** at //the start// with **multiple //types// of** markup</p>
          <p>some [[remarks]] and some __underline__</p>
          <p>include {{^superscripts}} and {{_subscripts}} which are fun</p>
          <p>an {{IMG /foo.png description}} image</p>
          <p>PART in the middle</p>
          <p>PART A should be escaped</p>
          <p>list __intro__</p>
          <p>(a) item (a) with a {{>http://example.com link}}</p>
          <p>CHAPTER.foo</p>
          <p>QUOTE{}</p>
          <p>FOOTNOTE 1</p>
          <p>TABLE in wrapup</p>
        </mainBody>
      </statement>
    </akomaNtoso>`;

      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const grammar = new BluebellGrammarModel();
      grammar.setup();
      expect(grammar.xmlToText(doc)).to.equal(`\\PART

a plain \\\\ backslash

some \\**text\\** at \\//the start\\// with \\**multiple \\//types\\// of\\** markup

some \\[[remarks\\]] and some \\__underline\\__

include \\{{^superscripts\\}} and \\{{_subscripts\\}} which are fun

an \\{{IMG /foo.png description\\}} image

\\PART in the middle

\\PART A should be escaped

list \\__intro\\__

\\(a) item (a) with a \\{{>http:\\//example.com link\\}}

\\CHAPTER.foo

\\QUOTE{}

\\FOOTNOTE 1

\\TABLE in wrapup
`);
    });
  });
});
