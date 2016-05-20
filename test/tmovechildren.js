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

  it('updates the parent cache', function () {
    return redis.tmovechildren('tree', '3', '5').then(function (index) {
      expect(index).to.eql(1);
      return redis.tchildren('tree', '5', { level: -1 });
    }).then(function (children) {
      expect(children).to.eql([
        { node: '6', hasChild: false }
      ]);
    });
  });

  it('supports prepend', function () {
    return redis.tmovechildren('tree', '8', 'ROOT1', 'PREPEND').then(function (index) {
      expect(index).to.eql(2);
      return redis.tchildren('tree', 'ROOT1', { level: 1 });
    }).then(function (children) {
      expect(children).to.eql([
        { node: '6', hasChild: false },
        { node: '7', hasChild: false },
        { node: '1', hasChild: false },
        { node: '2', hasChild: true },
        { node: '3', hasChild: true }
      ]);
    });
  });

  it('throws when move nodes to its child', function () {
    var caught = false;
    return redis.tmovechildren('tree', 'ROOT1', '6').catch(function (err) {
      expect(err.message).to.eql('ERR parent node cannot be the posterity of new node');
      caught = true;
    }).then(function () {
      expect(caught).to.eql(true);
    });
  });
});
