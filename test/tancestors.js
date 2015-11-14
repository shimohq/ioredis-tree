describe('tancestors', function () {
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

  it('returns empty array when tree or node does not exist', function () {
    return redis.tancestors('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql([]);
      return redis.tancestors('tree', 'non-exist node').then(function (res) {
        expect(res).to.eql([]);
      });
    });
  });

  it('returns parent', function () {
    return redis.tancestors('tree', '6').then(function (res) {
      expect(res).to.eql(['3', 'ROOT']);
      return redis.tancestors('tree', '2').then(function (res) {
        expect(res).to.eql(['ROOT']);
      });
    });
  });

  describe('LEVEL', function () {
    it('supports level', function () {
      return redis.tancestors('tree', '6', { level: 1 }).then(function (res) {
        expect(res).to.eql(['3']);
        return redis.tancestors('tree', '2', { level: 0 }).then(function (res) {
          expect(res).to.eql([]);
        });
      });
    });
  });
});
