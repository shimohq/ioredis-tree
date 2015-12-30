describe('trename', function () {
  it('renames a node successfully', function () {
    return redis.trename('tree', '2', 'new').then(function () {
      return redis.tchildren('tree', 'ROOT1', { level: 1 }).then(function (nodes) {
        expect(nodes).to.have.lengthOf(3);
        expect(nodes[1]).to.have.property('node', 'new');
      });
    }).then(function () {
      return redis.tparents('tree', '4').then(function (nodes) {
        expect(nodes).to.have.lengthOf(1);
        expect(nodes[0]).to.eql('new');
      });
    }).then(function () {
      return redis.tparents('tree', 'new').then(function (nodes) {
        expect(nodes).to.have.lengthOf(1);
        expect(nodes[0]).to.eql('ROOT1');
      });
    });
  });

  it('is able to rename an empty node', function () {
    return redis.trename('tree', '5', 'new').then(function () {
      return redis.tchildren('tree', '4', { level: 1 }).then(function (nodes) {
        expect(nodes[0]).to.have.property('node', 'new');
      });
    });
  });

  it('is able to rename a top-level node', function () {
    return redis.trename('tree', 'ROOT1', 'new').then(function () {
      return redis.tparents('tree', '2').then(function (nodes) {
        expect(nodes[0]).to.eql('new');
      });
    });
  });

  it('throws when the target node exists', function () {
    var error;
    return redis.trename('tree', 'ROOT1', '5').catch(function (err) {
      error = err;
    }).then(function () {
      expect(error).to.have.property('message', 'ERR target node already exists');
    });
  });

  it('makes the old key not existing', function () {
    return redis.trename('tree', '2', 'new').then(function () {
      return redis.texists('tree', '2').then(function (exists) {
        expect(exists).to.eql(0);
      });
    });
  });
});
