// attempt custom evaluation sandbox for hydra functions
// for now, just avoids polluting the global namespace
// should probably be replaced with an abstract syntax tree

export default (parent: Record<string, any>) => {
  var initialCode = ``;

  var sandbox = createSandbox(initialCode);

  var addToContext = (name: string, object: string) => {
    initialCode += `
      var ${name} = ${object}
    `;
    sandbox = createSandbox(initialCode);
  };

  return {
    addToContext: addToContext,
    eval: (code: string) => sandbox.eval(code),
  };

  function createSandbox(initial: string) {
    eval(initial);
    // optional params
    var localEval = function (code: string) {
      eval(code);
    };

    // API/data for end-user
    return {
      eval: localEval,
    };
  }
};
