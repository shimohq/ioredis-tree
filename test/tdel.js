describe('tdel', function () {
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
    return redis.del('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql(0);
      return redis.del('tree', 'non-exist node').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });

  it('returns delete count', function () {
    return redis.tdel('tree', '6').then(function (res) {
      expect(res).to.eql(1);
    });
  });

  it('deletes recursively', function () {
    return redis.tdel('tree', '2').then(function (res) {
      expect(res).to.eql(3);
      return redis.texists('tree', '5').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });
});
