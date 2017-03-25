path = require('path');

goodPath = path.join(__dirname, 'files', 'good.py');
badPath = path.join(__dirname, 'files', 'bad.py');
emptyPath = path.join(__dirname, 'files', 'empty.py');

describe('The coala provider for Linter', () => {
  lint = require('../lib/main').provideLinter().lint;

  beforeEach(() => {
    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('coala'),
      ])
    );
  });

  it('should be in the packages list', () =>
    expect(atom.packages.isPackageLoaded('coala')).toBe(true)
  );

  it('should be an active package', () =>
    expect(atom.packages.isPackageActive('coala')).toBe(true)
  );

  describe('checks bad file and', () => {
    editor = null;
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badPath).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds at least one message', () =>
      waitsForPromise(() =>
        lint(editor).then(messages => {
          // console.log messages
          expect(messages.length).toBeGreaterThan(0);
        })
      )
    );

    it('verifies that message', () =>
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('warning');
          expect(messages[0].html).not.toBeDefined();
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual(
            'LineLengthBear:Line is longer than allowed. (103 > 80)');
          expect(messages[0].location).toBeDefined();
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(
            /.+spec[\\\/]files[\\\/]bad\.py$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position.length).toEqual(2);
          expect(messages[0].location.position).toEqual([[0, 80], [0, 103]]);
        })
      )
    );
  });

  it('finds nothing wrong with an empty file', () => {
    waitsForPromise(() =>
      atom.workspace.open(emptyPath).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      )
    );
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() =>
      atom.workspace.open(goodPath).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      )
    );
  });
});
