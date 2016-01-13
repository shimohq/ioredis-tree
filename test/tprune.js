describe.only('tprune', function () {
  it('returns OK when tree or node does not exist', function () {
    return redis.tprune('non-exist tree', 'ROOT', 0, '1').then(function (res) {
      expect(res).to.eql('OK');
      return redis.tprune('tree', 'non-exist node', 0 ,'1').then(function (res) {
        expect(res).to.eql('OK');
      });
    });
  });

  it('prune successfully', function () {
    return redis.tprune('tree', 'ROOT2').then(function (res) {
      return redis.tparents('tree', '6').then(function (keys) {
        expect(keys).to.eql(['8']);

        return redis.tchildren('tree', '3').then(function (children) {
          expect(children).to.have.lengthOf(0);
        });
      });
    });
  });
});
