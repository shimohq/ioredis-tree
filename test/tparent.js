describe('tparent', function () {
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

  it('returns nil when tree or node does not exist', function () {
    return redis.tparent('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql(null);
      return redis.tparent('tree', 'non-exist node').then(function (res) {
        expect(res).to.eql(null);
      });
    });
  });

  it('returns parent', function () {
    return redis.tparent('tree', '6').then(function (res) {
      expect(res).to.eql('3');
      return redis.tparent('tree', '2').then(function (res) {
        expect(res).to.eql('ROOT');
      });
    });
  });
});
