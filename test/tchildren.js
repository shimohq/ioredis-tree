describe('tchildren', function () {
  it('returns empty array when tree does not exist', function () {
    return redis.tchildren('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql([]);
    });
  });

  it('returns childCount and children correctly', function () {
    return redis.tchildren('tree', 'ROOT1').then(function (res) {
      expect(res).to.eql([
        { node: '1', hasChild: false },
        { node: '2', hasChild: true, children: [
          { node: '4', hasChild: true, children: [
            { node: '5', hasChild: false }
          ] }
        ] },
        { node: '3', hasChild: true, children: [
          { node: '6', hasChild: false }
        ] },
      ]);
    });
  });

  describe('LEVEL', function () {
    it('returns null when level is 0', function () {
      return redis.tchildren('tree', 'ROOT1', { level: 0 }).then(function (res) {
        expect(res).to.eql(null);
      });
    });

    it('returns the specified level', function () {
      return redis.tchildren('tree', 'ROOT1', { level: 1 }).then(function (res) {
        expect(res).to.eql([
          { node: '1', hasChild: false },
          { node: '2', hasChild: true },
          { node: '3', hasChild: true }
        ]);
        return redis.tchildren('tree', 'ROOT1', { level: 2 }).then(function (res) {
          expect(res).to.eql([
            { node: '1', hasChild: false },
            { node: '2', hasChild: true, children: [
              { node: '4', hasChild: true }
            ] },
            { node: '3', hasChild: true, children: [
              { node: '6', hasChild: false }
            ] },
          ]);
        });
      });
    });
  });
});
