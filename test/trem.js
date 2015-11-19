describe('trem', function () {
  it('returns 0 when tree or node does not exist', function () {
    return redis.trem('non-exist tree', 'ROOT', 0, '1').then(function (res) {
      expect(res).to.eql(0);
      return redis.trem('tree', 'non-exist node', 0 ,'1').then(function (res) {
        expect(res).to.eql(0);
      });
    });
  });

  it('returns delete count', function () {
    return redis.trem('tree', '3', 0, '6').then(function (res) {
      expect(res).to.eql(0);

      return redis.tchildren('tree', '3').then(function (keys) {
        expect(keys).to.eql([]);
      });
    });
  });

  it('only remove the first `count` elements', function () {
    return redis.tinsert('tree', 'ROOT1', '2').then(function () {
      return redis.trem('tree', 'ROOT1', '1', '2').then(function (count) {
        expect(count).to.eql(1);
      });
    });
  });
});
