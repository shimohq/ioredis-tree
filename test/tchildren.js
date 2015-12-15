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

  it('throws when there is a infinite loop', function (done) {
    redis.defineCommand('_tdirectlyset', {
      numberOfKeys: 0,
      lua: 'redis.call("set", "{tree}::a", cmsgpack.pack({{ "a", 1 }})) return 0'
    })
    Promise.all([
      redis._tdirectlyset()
    ]).then(function () {
      redis.tchildren('tree', 'a').catch(function (e) {
        expect(e).to.match(/infinite loop/);
        done();
      });
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
