describe('tparents', function () {
  it('returns empty array when tree or node does not exist', function () {
    return redis.tparents('non-exist tree', 'ROOT').then(function (res) {
      expect(res).to.eql([]);
      return redis.tparents('tree', 'non-exist node').then(function (res) {
        expect(res).to.eql([]);
      });
    });
  });

  it('returns parent', function () {
    return redis.tparents('tree', '6').then(function (res) {
      expect(res).to.eql(['3', '8']);
      return redis.tparents('tree', '2').then(function (res) {
        expect(res).to.eql(['ROOT1']);
      });
    });
  });
});
