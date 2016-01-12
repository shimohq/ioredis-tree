describe('tmrem', function () {
  it('returns 0 when tree or node does not exist', function () {
    return redis.tmrem('non-exist tree', 'ROOT', 0, '1').then(function (res) {
      expect(res).to.eql(0);
      return redis.tmrem('tree', 'non-exist node', 0 ,'1').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });

  it('returns count of parents being removed from', function () {
    return redis.tmrem('tree', '6').then(function (res) {
      expect(res).to.eql(2);

      return redis.tchildren('tree', '3').then(function (keys) {
        expect(keys).to.eql([]);
        return redis.tchildren('tree', '8').then(function (keys) {
          expect(keys).to.have.lengthOf(1);
        });
      });
    });
  });

  it('supports exclude option', function () {
    return redis.tmrem('tree', '6', { not: '8' }).then(function (res) {
      expect(res).to.eql(1);

      return redis.tchildren('tree', '3').then(function (keys) {
        expect(keys).to.eql([]);
        return redis.tchildren('tree', '8').then(function (keys) {
          expect(keys).to.have.lengthOf(2);
        });
      });
    });
  });
});
