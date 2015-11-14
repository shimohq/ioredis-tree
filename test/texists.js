describe('texists', function () {
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
});
