// attempt custom evaluation sandbox for hydra functions
// for now, just avoids polluting the global namespace
// should probably be replaced with an abstract syntax tree
export const Sandbox = (parent) => {
    let initialCode = ``;
    let sandbox = createSandbox(initialCode);
    const addToContext = (name, object) => {
        initialCode += `
      var ${name} = ${object}
    `;
        sandbox = createSandbox(initialCode);
    };
    return {
        addToContext: addToContext,
        eval: (code) => sandbox.eval(code),
    };
    function createSandbox(initial) {
        eval(initial);
        // optional params
        const localEval = function (code) {
            eval(code);
        };
        // API/data for end-user
        return {
            eval: localEval,
        };
    }
};
