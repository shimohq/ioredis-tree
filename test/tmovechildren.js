describe('tmovechildren', function () {
  it('moves children to a non-exists tree', function () {
    return redis.tmovechildren('tree', 'ROOT1', 'target').then(function (index) {
      expect(index).to.eql(3);
      return redis.tchildren('tree', 'target', { level: 1 });
    }).then(function (children) {
      expect(children).to.eql([
        { node: '1', hasChild: false },
        { node: '2', hasChild: true },
        { node: '3', hasChild: true }
      ]);
    });
  });

  it('moves a non-exists tree to a tree', function () {
    return redis.tmovechildren('tree', 'non-exists', 'ROOT1').then(function (index) {
      expect(index).to.eql(0);
      return redis.tchildren('tree', 'ROOT1', { level: 1 });
    }).then(function (children) {
      expect(children).to.eql([
        { node: '1', hasChild: false },
        { node: '2', hasChild: true },
        { node: '3', hasChild: true }
      ]);
    });
  });
});
