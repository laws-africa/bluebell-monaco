import { expect } from 'chai';
import { BluebellActions } from "../src/actions";

describe('BluebellActions', () => {
  describe('#getMarkedInlineRanges()', () => {
    it('should handle good cases', () => {
      const bb = new BluebellActions();
      expect(bb.getMarkedInlineRanges('**foo**', '**')).to.eql([[0, 6]]);
      expect(bb.getMarkedInlineRanges(' **foo** ', '**')).to.eql([[1, 7]]);
      expect(bb.getMarkedInlineRanges('**foo** and **baz** and **bar**', '**')).to.eql([[0, 6], [12, 18], [24, 30]]);
    });

    it('should provide offsets that can be sliced', () => {
      const bb = new BluebellActions();
      const str = '**foo** and **baz** and **bar**';
      const ranges = bb.getMarkedInlineRanges(str, '**');
      expect(ranges.map(p => str.slice(p[0], p[1] + 1))).to.eql(['**foo**', '**baz**', '**bar**']);
    });

    it('should handle empty strings', () => {
      const bb = new BluebellActions();
      expect(bb.getMarkedInlineRanges('', '**')).to.eql([]);
      expect(bb.getMarkedInlineRanges('   ', '**')).to.eql([]);
    });

    it('should handle malformed pairs', () => {
      const bb = new BluebellActions();
      expect(bb.getMarkedInlineRanges('*', '**')).to.eql([]);
      expect(bb.getMarkedInlineRanges('**', '**')).to.eql([]);
      expect(bb.getMarkedInlineRanges(' **', '**')).to.eql([]);
      expect(bb.getMarkedInlineRanges(' * ** *', '**')).to.eql([]);
      expect(bb.getMarkedInlineRanges('****', '**')).to.eql([[0, 3]]);
    });

    it('should handle unmatched pairs', () => {
      const bb = new BluebellActions();
      expect(bb.getMarkedInlineRanges('**foo** **', '**')).to.eql([[0, 6]]);
      expect(bb.getMarkedInlineRanges('**foo** ***', '**')).to.eql([[0, 6]]);
      expect(bb.getMarkedInlineRanges('**foo** ***', '**')).to.eql([[0, 6]]);
      expect(bb.getMarkedInlineRanges('** * *', '**')).to.eql([]);
    });
  });
});
