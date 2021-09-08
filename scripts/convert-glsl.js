"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glsl_functions_1 = __importDefault(require("../src/glsl/glsl-functions"));
const fs_1 = __importDefault(require("fs"));
// eslint-disable-next-line no-unused-vars
let glslFunctions = [];
// eslint-disable-next-line no-unused-vars
const typeLookup = {
    src: {
        returnType: 'vec4',
        args: ['vec2 _st'],
    },
    coord: {
        returnType: 'vec2',
        args: ['vec2 _st'],
    },
    color: {
        returnType: 'vec4',
        args: ['vec4 _c0'],
    },
    combine: {
        returnType: 'vec4',
        args: ['vec4 _c0', 'vec4 _c1'],
    },
    combineCoords: {
        returnType: 'vec2',
        args: ['vec2 _st', 'vec4 c0'],
    },
};
var output = `export default [
  ${Object.keys(glsl_functions_1.default)
    .map((key) => {
    var inputs = glsl_functions_1.default[key].inputs;
    var res = glsl_functions_1.default[key].glsl.split('\n');
    res.splice(0, 1);
    res.splice(res.length - 1, 1);
    var trimmed = res.map((str) => str.trim());
    var str = `${trimmed.join('\n')}`;
    return `{
  name: '${key}',
  type: '${glsl_functions_1.default[key].type}',
  inputs: [
    ${inputs
        .map((input) => `{
      type: '${input.type}',
      name: '${input.name}',
      default: '${input.default}'
    }`)
        .join(',\n')}
  ],
  glsl:
\`${str}\`
}`;
})
    .join(',\n')}
]`;
// var output = `export default [
//   ${Object.keys(functions).map((key) => {
// //  console.log(key)
//
//   var inputs = functions[key].inputs
//   var res = functions[key].glsl.split('\n')
//   res.splice(0, 1)
//   res.splice(res.length-1, 1)
//   var str = `${res.join('\n')}`
//   //   console.log(str)
//   // var str = `testing
//   // hey`
//   var obj = {
//     name: key,
//     type: functions[key].type,
//     inputs: inputs,
//     glsl: str
//   }
//   glslFunctions.push(obj)
// //  console.log('  ')
//   return str
// })}`
fs_1.default.writeFileSync('./converted-functions.js', output, 'utf-8');
