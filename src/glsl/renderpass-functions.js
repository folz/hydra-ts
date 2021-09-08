"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// to add: ripple: https://www.shadertoy.com/view/4djGzz
// mask
// convolution
// basic sdf shapes
// repeat
// iq color palletes
const glslify_1 = __importDefault(require("glslify"));
exports.default = {
    blur: {
        type: 'renderpass',
        inputs: [
            {
                type: 'float',
                name: 'directionX',
                default: 1.0,
            },
            {
                type: 'float',
                name: 'directionY',
                default: 0.0,
            },
        ],
        frag: (0, glslify_1.default)('./gaussian.frag'),
    },
};
