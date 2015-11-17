describe('tinsert', function () {
  beforeEach(function () {
    return redis.tinsert('tree', 'ROOT', 'pivot');
  });

  it('inserts a node into a non-exists tree', function () {
    return redis.tinsert('non-exists tree', 'parent', 'node', { index: 0 }).then(function (index) {
      expect(index).to.eql(0);
      return redis.tchildren('non-exists tree', 'parent');
    }).then(function (children) {
      expect(children).to.eql([{ node: 'node', hasChild: false }]);
    });
  });

  describe('INDEX', function () {
    it('inserts to the tail when not specified options', function () {
      return redis.tinsert('tree', 'ROOT', 'node').then(function (index) {
        expect(index).to.eql(1);
        return redis.tchildren('tree', 'ROOT');
      }).then(function (children) {
        expect(children).to.eql([{ node: 'pivot', hasChild: false }, { node: 'node', hasChild: false }]);
      });
    });

    context('when specified', function () {
      beforeEach(function () {
        return redis.tinsert('tree', 'ROOT', 'tail');
      });

      it('inserts to the specified index', function () {
        return redis.tinsert('tree', 'ROOT', 'head', { index: 0 }).then(function (index) {
          expect(index).to.eql(0);
        });
      });

      it('supports negative index', function () {
        return redis.tinsert('tree', 'ROOT', 'middle', { index: -2 }).then(function (index) {
          expect(index).to.eql(1);
        });
      });

      it('insert to the tail when out of range', function () {
        return redis.tinsert('tree', 'ROOT', 'end', { index: 200 }).then(function (index) {
          expect(index).to.eql(2);
        });
      });

      it('insert to the head when out of range (negative)', function () {
        return redis.tinsert('tree', 'ROOT', 'begin', { index: -200 }).then(function (index) {
          expect(index).to.eql(0);
        });
      });
    });
  });

  describe('BEFORE', function () {
    beforeEach(function () {
      return redis.tinsert('tree', 'ROOT', '1');
    });

    it('inserts before the pivot', function () {
      return redis.tinsert('tree', 'ROOT', '0', { before: 1 }).then(function (index) {
        expect(index).to.eql(1);
      });
    });

    it('inserts to the head when pivot is not found', function () {
      return redis.tinsert('tree', 'ROOT', '0', { before: 'non-exists' }).then(function (index) {
        expect(index).to.eql(0);
      });
    });
  });

  describe('AFTER', function () {
    beforeEach(function () {
      return redis.tinsert('tree', 'ROOT', '1');
    });

    it('inserts after the pivot', function () {
      return redis.tinsert('tree', 'ROOT', '0', { after: 'pivot' }).then(function (index) {
        expect(index).to.eql(1);
      });
    });

    it('inserts to the tail when pivot is not found', function () {
      return redis.tinsert('tree', 'ROOT', '0', { after: 'non-exists' }).then(function (index) {
        expect(index).to.eql(2);
      });
    });
  });
});
