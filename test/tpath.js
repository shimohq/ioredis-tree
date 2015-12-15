describe('tpath', function () {
  it('returns null when tree or node does not exist', function () {
    return redis.tpath('non-exist tree', 'ROOT1', '1').then(function (res) {
      expect(res).to.eql(null);
      return redis.tpath('tree', 'non-exist node', '1').then(function (res) {
        expect(res).to.eql(null);
      });
    });
  });

  it('returns path', function () {
    return Promise.all([
      redis.tpath('tree', 'ROOT1', '1').then(function (res) {
        expect(res).to.eql([]);
      }),
      redis.tpath('tree', 'ROOT1', '7').then(function (res) {
        expect(res).to.eql(null);
      }),
      redis.tpath('tree', 'ROOT1', '6').then(function (res) {
        expect(res).to.eql(['3']);
      }),
      redis.tpath('tree', 'ROOT1', '5').then(function (res) {
        expect(res).to.eql(['2', '4']);
      }),
      redis.tpath('tree', 'ROOT1', 'ROOT2').then(function (res) {
        expect(res).to.eql(null);
      }),
      redis.tpath('tree', 'ROOT2', '7').then(function (res) {
        expect(res).to.eql(['8']);
      }),
    ]);
  });

  it('throws when there is a infinite loop', function (done) {
    Promise.all([
      redis.sadd('{tree}::b::P', 'b')
    ]).then(function () {
      redis.tpath('tree', 'a', 'b').catch(function (e) {
        expect(e).to.match(/infinite loop/);
        done();
      });
    });
  });

  it('throws when there is a infinite loop (with multiple parents)', function (done) {
    redis.defineCommand('_tdirectlyset', {
      numberOfKeys: 0,
      lua: 'redis.call("set", "{tree}::a", cmsgpack.pack({{ "a", 1 }})) return 0'
    })
    Promise.all([
      redis._tdirectlyset(),
      redis.sadd('{tree}::b::P', 'c', 'd')
    ]).then(function () {
      redis.tpath('tree', 'a', 'b').catch(function (e) {
        expect(e).to.match(/infinite loop/);
        done();
      });
    });
  });
});
