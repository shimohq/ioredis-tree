describe('texists', function () {
  it('returns 0 when tree or node does not exist', function () {
    return redis.texists('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql(0);
      return redis.texists('tree', 'non-exist node').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });

  it('returns 1 otherwise', function () {
    return redis.texists('tree', '6').then(function (res) {
      expect(res).to.eql(1);
    });
  });

  it('returns 0 when the node has no child and parent', function () {
    return Promise.all([
      redis.trem('tree', 'ROOT1', 0, '2'),
      redis.trem('tree', '2', 0, '4')
    ]).then(function () {
      return redis.texists('tree', '2').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });
});
