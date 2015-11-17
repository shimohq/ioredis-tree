describe('tdestroy', function () {
  it('returns 0 when tree or node does not exist', function () {
    return redis.tdestroy('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql(0);
      return redis.tdestroy('tree', 'non-exist node').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });

  it('returns delete count', function () {
    return redis.tdestroy('tree', '6').then(function (res) {
      expect(res).to.eql(1);
    });
  });

  it('deletes recursively', function () {
    return redis.tdestroy('tree', '2').then(function (res) {
      expect(res).to.eql(3);
      return redis.texists('tree', '5').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });

  it('does not leave any keys', function () {
    return Promise.all([
      redis.tdestroy('tree', 'ROOT1'),
      redis.tdestroy('tree', 'ROOT2')
    ]).then(function () {
      return redis.keys('*').then(function (keys) {
        expect(keys).to.eql([]);
      });
    });
  });
});
