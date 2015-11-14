describe('tchildren', function () {
  beforeEach(function () {
    return Promise.all([
      redis.tinsert('tree', 'ROOT', '1'),
      redis.tinsert('tree', 'ROOT', '2'),
      redis.tinsert('tree', 'ROOT', '3'),
      redis.tinsert('tree', '2', '4'),
      redis.tinsert('tree', '4', '5'),
      redis.tinsert('tree', '3', '6'),
    ]);
  });

  it('returns empty array when tree does not exist', function () {
    return redis.tchildren('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql([]);
    });
  });

  it('returns childCount and children correctly', function () {
    return redis.tchildren('tree', 'ROOT').then(function (res) {
      expect(res).to.eql([
        { node: '1', childCount: 0 },
        { node: '2', childCount: 1, children: [
          { node: '4', childCount: 1, children: [
            { node: '5', childCount: 0 }
          ] }
        ] },
        { node: '3', childCount: 1, children: [
          { node: '6', childCount: 0 }
        ] },
      ]);
    });
  });

  describe('LEVEL', function () {
    it('returns null when level is 0', function () {
      return redis.tchildren('tree', 'ROOT', { level: 0 }).then(function (res) {
        expect(res).to.eql(null);
      });
    });

    it('returns the specified level', function () {
      return redis.tchildren('tree', 'ROOT', { level: 1 }).then(function (res) {
        expect(res).to.eql([
          { node: '1', childCount: 0 },
          { node: '2', childCount: 1 },
          { node: '3', childCount: 1 }
        ]);
        return redis.tchildren('tree', 'ROOT', { level: 2 }).then(function (res) {
          expect(res).to.eql([
            { node: '1', childCount: 0 },
            { node: '2', childCount: 1, children: [
              { node: '4', childCount: 1 }
            ] },
            { node: '3', childCount: 1, children: [
              { node: '6', childCount: 0 }
            ] },
          ]);
        });
      });
    });
  });
});
