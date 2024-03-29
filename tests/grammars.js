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
          <p eId="dvs_A__p_2"><i>Recalling</i> decision XI/6, <del>including paragraph 3, </del>in which it urged Parties to pursue efforts<ins> and programmes</ins> to enhance synergies among the biodiversity-related conventions to promote policy coherence, improve efficiency and enhance coordination and cooperation at all levels, and with a view to strengthening Parties’ ownership of the process,</p>
        </intro>
        <paragraph eId="dvs_A__para_1">
          <num>1.</num>
          <content>
            <p eId="dvs_A__para_1__p_1"><i>Welcomes</i> the International Plant Protection Convention as a member of the Liaison Group of the Biodiversity-related Conventions and <i>notes</i> with appreciation the role of the International Plant Protection Convention in helping to achieve Aichi Biodiversity Target 9;</p>
            <blockList eId="dvs_A__list_1">
              <listIntroduction eId="dvs_A__list_1__intro_1">some intro with <authorialNote marker="1" placement="bottom" eId="dvs_A__list_1__intro_1__authorialNote_1"><p eId="dvs_A__list_1__intro_1__authorialNote_1__p_1">footnote 1</p></authorialNote> and <authorialNote marker="2" placement="bottom" eId="dvs_A__list_1__intro_1__authorialNote_2"><p eId="dvs_A__list_1__intro_1__authorialNote_2__p_1">footnote 2</p></authorialNote></listIntroduction>
              <item eId="dvs_A__list_1__item_a">
                <num>(a)</num>
                <p eId="dvs_A__list_1__item_a__p_1">item a</p>
              </item>
              <listWrapUp eId="dvs_A__list_1__wrapup_1">wrap up with <authorialNote marker="3" placement="bottom" eId="dvs_A__list_1__wrapup_1__authorialNote_1"><p eId="dvs_A__list_1__wrapup_1__authorialNote_1__p_1">footnote 3</p></authorialNote></listWrapUp>
            </blockList>
            <ul eId="dvs_A__para_1__ul_1">
              <li eId="dvs_A__para_1__ul_1__li_1">
                <p eId="dvs_A__para_1__ul_1__li_1__p_1">item 1</p>
              </li>
              <li eId="dvs_A__para_1__ul_1__li_2">
                <p eId="dvs_A__para_1__ul_1__li_2__p_1">item 2</p>
              </li>
              <li eId="dvs_A__para_1__ul_1__li_3">
                <p eId="dvs_A__para_1__ul_1__li_3__p_1">item 3</p>
              </li>
            </ul>
            <p class="my-class">With a class</p>
            <p>Text with <inline name="em">emphasis and <abbr title="Abbreviations">ABBR</abbr></inline> and <term refersTo="#foo">terms</term>.</p>
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

  //Recalling// decision XI/6, {{- including paragraph 3, }}in which it urged Parties to pursue efforts{{+  and programmes}} to enhance synergies among the biodiversity-related conventions to promote policy coherence, improve efficiency and enhance coordination and cooperation at all levels, and with a view to strengthening Parties’ ownership of the process,

  PARA 1.

    //Welcomes// the International Plant Protection Convention as a member of the Liaison Group of the Biodiversity-related Conventions and //notes// with appreciation the role of the International Plant Protection Convention in helping to achieve Aichi Biodiversity Target 9;

    ITEMS
      some intro with {{FOOTNOTE 1}} and {{FOOTNOTE 2}}

      FOOTNOTE 1
        footnote 1

      FOOTNOTE 2
        footnote 2

      ITEM (a)
        item a

      wrap up with {{FOOTNOTE 3}}

      FOOTNOTE 3
        footnote 3

    BULLETS
      * item 1
      * item 2
      * item 3

    P.my-class With a class

    Text with {{em emphasis and {{abbr{title Abbreviations} ABBR}}}} and {{term{refersTo #foo} terms}}.
`);
    });

    it('should escape when unparsing', () => {
      const xml = `<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
      <statement>
        <mainBody>
          <p>PART</p>
          <p>a plain \\ backslash</p>
          <p>some **text** at //the start// with **multiple //types// of** markup</p>
          <p>some {{*remarks}} and some __underline__</p>
          <p>include {{^superscripts}} and {{_subscripts}} which are fun</p>
          <p>an {{IMG /foo.png description}} image</p>
          <p>PART in the middle</p>
          <p>PART A should be escaped</p>
          <p>list __intro__</p>
          <p>(a) item (a) with a {{>http://example.com link}}</p>
          <p>CHAPTER.foo</p>
          <p>QUOTE{}</p>
          <p>  ITEMS</p>
          <p>  BLOCKLIST</p>
          <p>  BULLETS</p>
          <p>FOOTNOTE 1</p>
          <p>TABLE in wrapup</p>
          <p>TC</p>
          <p>TH</p>
          <p>P foo</p>
          <p>P.bar foo</p>
          <p>P{class foo} bar</p>
          <p>Posh doesn't need to be escaped</p>
        </mainBody>
      </statement>
    </akomaNtoso>`;

      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const grammar = new BluebellGrammarModel();
      grammar.setup();
      expect(grammar.xmlToText(doc)).to.equal(`\\PART

a plain \\\\ backslash

some \\*\\*text\\*\\* at \\/\\/the start\\/\\/ with \\*\\*multiple \\/\\/types\\/\\/ of\\*\\* markup

some \\{\\{*remarks\\}\\} and some \\_\\_underline\\_\\_

include \\{\\{^superscripts\\}\\} and \\{\\{_subscripts\\}\\} which are fun

an \\{\\{IMG /foo.png description\\}\\} image

\\PART in the middle

\\PART A should be escaped

list \\_\\_intro\\_\\_

(a) item (a) with a \\{\\{>http:\\/\\/example.com link\\}\\}

\\CHAPTER.foo

\\QUOTE{}

\\ITEMS

\\BLOCKLIST

\\BULLETS

\\FOOTNOTE 1

\\TABLE in wrapup

\\TC

\\TH

\\P foo

\\P.bar foo

\\P{class foo} bar

Posh doesn't need to be escaped
`);
    });

    it('should retain footnotes when unparsing all headings', () => {
      const xml = `<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
      <statement>
        <mainBody>
          <division eId="dvs_A">
            <num>A</num>
            <heading>Heading <authorialNote marker="x" placement="bottom" eId="dvs_A__authorialNote_1"><p eId="dvs_A__authorialNote_1__p_1">Content of footnote.</p></authorialNote></heading>
            <subheading>Subheading <authorialNote marker="y" placement="bottom" eId="dvs_A__authorialNote_2"><p eId="dvs_A__authorialNote_2__p_1">Content of footnote.</p></authorialNote></subheading>
            <content>
              <crossHeading eId="dvs_A__crossHeading_1">A crossheading <authorialNote marker="z" placement="bottom" eId="dvs_A__crossHeading_1__authorialNote_1">
                  <p eId="dvs_A__crossHeading_1__authorialNote_1__p_1">Content of footnote.</p>
                </authorialNote></crossHeading>
              <p eId="dvs_A__p_1">Content of Division A.</p>
            </content>
          </division>
        </mainBody>
        <attachments>
          <attachment eId="att_1">
            <heading>Annex <authorialNote marker="a" placement="bottom" eId="att_1__authorialNote_1"><p eId="att_1__authorialNote_1__p_1">Content of footnote.</p></authorialNote></heading>
            <subheading>Subheading <authorialNote marker="b" placement="bottom" eId="att_1__authorialNote_2"><p eId="att_1__authorialNote_2__p_1">Content of footnote.</p></authorialNote></subheading>
            <doc contains="originalVersion" name="annexure">
              <meta/>
              <mainBody>
                <p eId="att_1__p_1">Content of Annex.</p>
              </mainBody>
            </doc>
          </attachment>
        </attachments>
      </statement>
    </akomaNtoso>`;

      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const grammar = new BluebellGrammarModel();
      grammar.setup();
      expect(grammar.xmlToText(doc)).to.equal(`DIVISION A - Heading {{FOOTNOTE x}}
  SUBHEADING Subheading {{FOOTNOTE y}}

  FOOTNOTE x
    Content of footnote.

  FOOTNOTE y
    Content of footnote.

  CROSSHEADING A crossheading {{FOOTNOTE z}}

  FOOTNOTE z
    Content of footnote.

  Content of Division A.

ANNEXURE Annex {{FOOTNOTE a}}
  SUBHEADING Subheading {{FOOTNOTE b}}

  FOOTNOTE a
    Content of footnote.

  FOOTNOTE b
    Content of footnote.

  Content of Annex.
`);
    });

    it('should unparse block lists correctly', () => {
      const xml = `<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
      <statement>
        <mainBody>
          <division eId="dvs_A">
            <num>A</num>
            <heading>Heading <authorialNote marker="x" placement="bottom" eId="dvs_A__authorialNote_1"><p eId="dvs_A__authorialNote_1__p_1">Content of footnote.</p></authorialNote></heading>
            <subheading>Subheading <authorialNote marker="y" placement="bottom" eId="dvs_A__authorialNote_2"><p eId="dvs_A__authorialNote_2__p_1">Content of footnote.</p></authorialNote></subheading>
            <content>
              <crossHeading eId="dvs_A__crossHeading_1">A crossheading <authorialNote marker="z" placement="bottom" eId="dvs_A__crossHeading_1__authorialNote_1">
                  <p eId="dvs_A__crossHeading_1__authorialNote_1__p_1">Content of footnote.</p>
                </authorialNote></crossHeading>
              <p eId="dvs_A__p_1">Content of Division A.</p>
            </content>
          </division>
        </mainBody>
        <attachments>
          <attachment eId="att_1">
            <heading>Annex <authorialNote marker="a" placement="bottom" eId="att_1__authorialNote_1"><p eId="att_1__authorialNote_1__p_1">Content of footnote.</p></authorialNote></heading>
            <subheading>Subheading <authorialNote marker="b" placement="bottom" eId="att_1__authorialNote_2"><p eId="att_1__authorialNote_2__p_1">Content of footnote.</p></authorialNote></subheading>
            <doc contains="originalVersion" name="annexure">
              <meta/>
              <mainBody>
                <p eId="att_1__p_1">Content of Annex.</p>
              </mainBody>
            </doc>
          </attachment>
        </attachments>
      </statement>
    </akomaNtoso>`;

      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const grammar = new BluebellGrammarModel();
      grammar.setup();
      expect(grammar.xmlToText(doc)).to.equal(`DIVISION A - Heading {{FOOTNOTE x}}
  SUBHEADING Subheading {{FOOTNOTE y}}

  FOOTNOTE x
    Content of footnote.

  FOOTNOTE y
    Content of footnote.

  CROSSHEADING A crossheading {{FOOTNOTE z}}

  FOOTNOTE z
    Content of footnote.

  Content of Division A.

ANNEXURE Annex {{FOOTNOTE a}}
  SUBHEADING Subheading {{FOOTNOTE b}}

  FOOTNOTE a
    Content of footnote.

  FOOTNOTE b
    Content of footnote.

  Content of Annex.
`);
    });
  });

  it('should unparse nested footnotes correctly', () => {
    const xml = `<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">
  <statement>
    <mainBody>
      <division eId="dvs_A">
        <num>A.</num>
        <heading>Cooperation with other conventions</heading>
        <content>
          <p eId="dvs_A__p_1">Some text <sup><authorialNote marker="1"><p>Footnote with <authorialNote marker="2"><p>nested footnote</p></authorialNote></p></authorialNote></sup></p>
        </content>
      </division>
    </mainBody>
  </statement>
</akomaNtoso>`;

    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const grammar = new BluebellGrammarModel();
    grammar.setup();
    expect(grammar.xmlToText(doc)).to.equal(`DIVISION A. - Cooperation with other conventions

  Some text {{^{{FOOTNOTE 1}}}}

  FOOTNOTE 1
    Footnote with {{FOOTNOTE 2}}

    FOOTNOTE 2
      nested footnote
`);
  });
});
