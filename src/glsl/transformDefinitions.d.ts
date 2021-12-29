import { Texture2D } from 'regl';
export declare type TransformDefinitionType = 'src' | 'coord' | 'color' | 'combine' | 'combineCoord';
export declare type TransformDefinitionInputTypeFloat = {
    type: 'float';
    default?: number | number[] | ((context: any, props: any) => number | number[]);
};
export declare type TransformDefinitionInputTypeSampler2D = {
    type: 'sampler2D';
    default?: Texture2D | number;
};
export declare type TransformDefinitionInputTypeVec4 = {
    type: 'vec4';
    default?: string | number;
};
export declare type TransformDefinitionInputUnion = TransformDefinitionInputTypeFloat | TransformDefinitionInputTypeSampler2D | TransformDefinitionInputTypeVec4;
export declare type TransformDefinitionInput = TransformDefinitionInputUnion & {
    name: string;
    vecLen?: number;
};
export interface TransformDefinition {
    name: string;
    type: TransformDefinitionType;
    inputs: readonly TransformDefinitionInput[];
    glsl: string;
}
export interface ProcessedTransformDefinition extends TransformDefinition {
    processed: true;
}
export declare const generatorTransforms: readonly [{
    readonly name: "noise";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scale";
        readonly default: 10;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0.1;
    }];
    readonly glsl: "   return vec4(vec3(_noise(vec3(_st*scale, offset*time))), 1.0);";
}, {
    readonly name: "voronoi";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scale";
        readonly default: 5;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0.3;
    }, {
        readonly type: "float";
        readonly name: "blending";
        readonly default: 0.3;
    }];
    readonly glsl: "   vec3 color = vec3(.0);\n   // Scale\n   _st *= scale;\n   // Tile the space\n   vec2 i_st = floor(_st);\n   vec2 f_st = fract(_st);\n   float m_dist = 10.;  // minimun distance\n   vec2 m_point;        // minimum point\n   for (int j=-1; j<=1; j++ ) {\n   for (int i=-1; i<=1; i++ ) {\n   vec2 neighbor = vec2(float(i),float(j));\n   vec2 p = i_st + neighbor;\n   vec2 point = fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);\n   point = 0.5 + 0.5*sin(time*speed + 6.2831*point);\n   vec2 diff = neighbor + point - f_st;\n   float dist = length(diff);\n   if( dist < m_dist ) {\n   m_dist = dist;\n   m_point = point;\n   }\n   }\n   }\n   // Assign a color using the closest point position\n   color += dot(m_point,vec2(.3,.6));\n   color *= 1.0 - blending*m_dist;\n   return vec4(color, 1.0);";
}, {
    readonly name: "osc";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "frequency";
        readonly default: 60;
    }, {
        readonly type: "float";
        readonly name: "sync";
        readonly default: 0.1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 st = _st;\n   float r = sin((st.x-offset/frequency+time*sync)*frequency)*0.5  + 0.5;\n   float g = sin((st.x+time*sync)*frequency)*0.5 + 0.5;\n   float b = sin((st.x+offset/frequency+time*sync)*frequency)*0.5  + 0.5;\n   return vec4(r, g, b, 1.0);";
}, {
    readonly name: "shape";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "sides";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "radius";
        readonly default: 0.3;
    }, {
        readonly type: "float";
        readonly name: "smoothing";
        readonly default: 0.01;
    }];
    readonly glsl: "   vec2 st = _st * 2. - 1.;\n   // Angle and radius from the current pixel\n   float a = atan(st.x,st.y)+3.1416;\n   float r = (2.*3.1416)/sides;\n   float d = cos(floor(.5+a/r)*r-a)*length(st);\n   return vec4(vec3(1.0-smoothstep(radius,radius + smoothing + 0.0000001,d)), 1.0);";
}, {
    readonly name: "gradient";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   return vec4(_st, sin(time*speed), 1.0);";
}, {
    readonly name: "src";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "sampler2D";
        readonly name: "tex";
        readonly default: number;
    }];
    readonly glsl: "return texture2D(tex, fract(_st));";
}, {
    readonly name: "solid";
    readonly type: "src";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "r";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "g";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "b";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "a";
        readonly default: 1;
    }];
    readonly glsl: "   return vec4(r, g, b, a);";
}];
export declare const modifierTransforms: readonly [{
    readonly name: "rotate";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "angle";
        readonly default: 10;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 xy = _st - vec2(0.5);\n   float ang = angle + speed *time;\n   xy = mat2(cos(ang),-sin(ang), sin(ang),cos(ang))*xy;\n   xy += 0.5;\n   return xy;";
}, {
    readonly name: "scale";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1.5;
    }, {
        readonly type: "float";
        readonly name: "xMult";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "yMult";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offsetX";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "offsetY";
        readonly default: 0.5;
    }];
    readonly glsl: "   vec2 xy = _st - vec2(offsetX, offsetY);\n   xy*=(1.0/vec2(amount*xMult, amount*yMult));\n   xy+=vec2(offsetX, offsetY);\n   return xy;\n   ";
}, {
    readonly name: "pixelate";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "pixelX";
        readonly default: 20;
    }, {
        readonly type: "float";
        readonly name: "pixelY";
        readonly default: 20;
    }];
    readonly glsl: "   vec2 xy = vec2(pixelX, pixelY);\n   return (floor(_st * xy) + 0.5)/xy;";
}, {
    readonly name: "posterize";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "bins";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "gamma";
        readonly default: 0.6;
    }];
    readonly glsl: "   vec4 c2 = pow(_c0, vec4(gamma));\n   c2 *= vec4(bins);\n   c2 = floor(c2);\n   c2/= vec4(bins);\n   c2 = pow(c2, vec4(1.0/gamma));\n   return vec4(c2.xyz, _c0.a);";
}, {
    readonly name: "shift";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "r";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "g";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "b";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "a";
        readonly default: 0;
    }];
    readonly glsl: "   vec4 c2 = vec4(_c0);\n   c2.r = fract(c2.r + r);\n   c2.g = fract(c2.g + g);\n   c2.b = fract(c2.b + b);\n   c2.a = fract(c2.a + a);\n   return vec4(c2.rgba);";
}, {
    readonly name: "repeat";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "repeatX";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "repeatY";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offsetX";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "offsetY";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 st = _st * vec2(repeatX, repeatY);\n   st.x += step(1., mod(st.y,2.0)) * offsetX;\n   st.y += step(1., mod(st.x,2.0)) * offsetY;\n   return fract(st);";
}, {
    readonly name: "modulateRepeat";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "repeatX";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "repeatY";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offsetX";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "offsetY";
        readonly default: 0.5;
    }];
    readonly glsl: "   vec2 st = _st * vec2(repeatX, repeatY);\n   st.x += step(1., mod(st.y,2.0)) + color.r * offsetX;\n   st.y += step(1., mod(st.x,2.0)) + color.g * offsetY;\n   return fract(st);";
}, {
    readonly name: "repeatX";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "reps";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 st = _st * vec2(reps, 1.0);\n   //  float f =  mod(_st.y,2.0);\n   st.y += step(1., mod(st.x,2.0))* offset;\n   return fract(st);";
}, {
    readonly name: "modulateRepeatX";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "reps";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0.5;
    }];
    readonly glsl: "   vec2 st = _st * vec2(reps, 1.0);\n   //  float f =  mod(_st.y,2.0);\n   st.y += step(1., mod(st.x,2.0)) + color.r * offset;\n   return fract(st);";
}, {
    readonly name: "repeatY";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "reps";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 st = _st * vec2(1.0, reps);\n   //  float f =  mod(_st.y,2.0);\n   st.x += step(1., mod(st.y,2.0))* offset;\n   return fract(st);";
}, {
    readonly name: "modulateRepeatY";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "reps";
        readonly default: 3;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0.5;
    }];
    readonly glsl: "   vec2 st = _st * vec2(reps, 1.0);\n   //  float f =  mod(_st.y,2.0);\n   st.x += step(1., mod(st.y,2.0)) + color.r * offset;\n   return fract(st);";
}, {
    readonly name: "kaleid";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "nSides";
        readonly default: 4;
    }];
    readonly glsl: "   vec2 st = _st;\n   st -= 0.5;\n   float r = length(st);\n   float a = atan(st.y, st.x);\n   float pi = 2.*3.1416;\n   a = mod(a,pi/nSides);\n   a = abs(a-pi/nSides/2.);\n   return r*vec2(cos(a), sin(a));";
}, {
    readonly name: "modulateKaleid";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "nSides";
        readonly default: 4;
    }];
    readonly glsl: "   vec2 st = _st - 0.5;\n   float r = length(st);\n   float a = atan(st.y, st.x);\n   float pi = 2.*3.1416;\n   a = mod(a,pi/nSides);\n   a = abs(a-pi/nSides/2.);\n   return (color.r+r)*vec2(cos(a), sin(a));";
}, {
    readonly name: "scroll";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scrollX";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "scrollY";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "speedX";
        readonly default: 0;
    }, {
        readonly type: "float";
        readonly name: "speedY";
        readonly default: 0;
    }];
    readonly glsl: "\n   _st.x += scrollX + time*speedX;\n   _st.y += scrollY + time*speedY;\n   return fract(_st);";
}, {
    readonly name: "scrollX";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scrollX";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   _st.x += scrollX + time*speed;\n   return fract(_st);";
}, {
    readonly name: "modulateScrollX";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "scrollX";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   _st.x += color.r*scrollX + time*speed;\n   return fract(_st);";
}, {
    readonly name: "scrollY";
    readonly type: "coord";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scrollY";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   _st.y += scrollY + time*speed;\n   return fract(_st);";
}, {
    readonly name: "modulateScrollY";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "scrollY";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "speed";
        readonly default: 0;
    }];
    readonly glsl: "   _st.y += color.r*scrollY + time*speed;\n   return fract(_st);";
}, {
    readonly name: "add";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1;
    }];
    readonly glsl: "   return (_c0+color)*amount + _c0*(1.0-amount);";
}, {
    readonly name: "sub";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1;
    }];
    readonly glsl: "   return (_c0-color)*amount + _c0*(1.0-amount);";
}, {
    readonly name: "layer";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }];
    readonly glsl: "   return vec4(mix(_c0.rgb, color.rgb, color.a), _c0.a+color.a);";
}, {
    readonly name: "blend";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "amount";
        readonly default: 0.5;
    }];
    readonly glsl: "   return _c0*(1.0-amount)+color*amount;";
}, {
    readonly name: "mult";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1;
    }];
    readonly glsl: "   return _c0*(1.0-amount)+(_c0*color)*amount;";
}, {
    readonly name: "diff";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }];
    readonly glsl: "   return vec4(abs(_c0.rgb-color.rgb), max(_c0.a, color.a));";
}, {
    readonly name: "modulate";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "amount";
        readonly default: 0.1;
    }];
    readonly glsl: "   //  return fract(st+(color.xy-0.5)*amount);\n   return _st + color.xy*amount;";
}, {
    readonly name: "modulateScale";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "multiple";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 1;
    }];
    readonly glsl: "   vec2 xy = _st - vec2(0.5);\n   xy*=(1.0/vec2(offset + multiple*color.r, offset + multiple*color.g));\n   xy+=vec2(0.5);\n   return xy;";
}, {
    readonly name: "modulatePixelate";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "multiple";
        readonly default: 10;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 3;
    }];
    readonly glsl: "   vec2 xy = vec2(offset + color.x*multiple, offset + color.y*multiple);\n   return (floor(_st * xy) + 0.5)/xy;";
}, {
    readonly name: "modulateRotate";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "multiple";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   vec2 xy = _st - vec2(0.5);\n   float angle = offset + color.x * multiple;\n   xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle))*xy;\n   xy += 0.5;\n   return xy;";
}, {
    readonly name: "modulateHue";
    readonly type: "combineCoord";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }, {
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1;
    }];
    readonly glsl: "   return _st + (vec2(color.g - color.r, color.b - color.g) * amount * 1.0/resolution);";
}, {
    readonly name: "invert";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1;
    }];
    readonly glsl: "   return vec4((1.0-_c0.rgb)*amount + _c0.rgb*(1.0-amount), _c0.a);";
}, {
    readonly name: "contrast";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 1.6;
    }];
    readonly glsl: "   vec4 c = (_c0-vec4(0.5))*vec4(amount) + vec4(0.5);\n   return vec4(c.rgb, _c0.a);";
}, {
    readonly name: "brightness";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 0.4;
    }];
    readonly glsl: "   return vec4(_c0.rgb + vec3(amount), _c0.a);";
}, {
    readonly name: "mask";
    readonly type: "combine";
    readonly inputs: readonly [{
        readonly name: "color";
        readonly type: "vec4";
        readonly vecLen: 4;
    }];
    readonly glsl: "   float a = _luminance(color.rgb);\n   return vec4(_c0.rgb*a, a);";
}, {
    readonly name: "luma";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "threshold";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "tolerance";
        readonly default: 0.1;
    }];
    readonly glsl: "   float a = smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb));\n   return vec4(_c0.rgb*a, a);";
}, {
    readonly name: "thresh";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "threshold";
        readonly default: 0.5;
    }, {
        readonly type: "float";
        readonly name: "tolerance";
        readonly default: 0.04;
    }];
    readonly glsl: "   return vec4(vec3(smoothstep(threshold-(tolerance+0.0000001), threshold+(tolerance+0.0000001), _luminance(_c0.rgb))), _c0.a);";
}, {
    readonly name: "color";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "r";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "g";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "b";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "a";
        readonly default: 1;
    }];
    readonly glsl: "   vec4 c = vec4(r, g, b, a);\n   vec4 pos = step(0.0, c); // detect whether negative\n   // if > 0, return r * _c0\n   // if < 0 return (1.0-r) * _c0\n   return vec4(mix((1.0-_c0)*abs(c), c*_c0, pos));";
}, {
    readonly name: "saturate";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 2;
    }];
    readonly glsl: "   const vec3 W = vec3(0.2125, 0.7154, 0.0721);\n   vec3 intensity = vec3(dot(_c0.rgb, W));\n   return vec4(mix(intensity, _c0.rgb, amount), _c0.a);";
}, {
    readonly name: "hue";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "hue";
        readonly default: 0.4;
    }];
    readonly glsl: "   vec3 c = _rgbToHsv(_c0.rgb);\n   c.r += hue;\n   //  c.r = fract(c.r);\n   return vec4(_hsvToRgb(c), _c0.a);";
}, {
    readonly name: "colorama";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "amount";
        readonly default: 0.005;
    }];
    readonly glsl: "   vec3 c = _rgbToHsv(_c0.rgb);\n   c += vec3(amount);\n   c = _hsvToRgb(c);\n   c = fract(c);\n   return vec4(c, _c0.a);";
}, {
    readonly name: "sum";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "vec4";
        readonly name: "scale";
        readonly default: 1;
    }];
    readonly glsl: "   vec4 v = _c0 * s;\n   return v.r + v.g + v.b + v.a;\n   }\n   float sum(vec2 _st, vec4 s) { // vec4 is not a typo, because argument type is not overloaded\n   vec2 v = _st.xy * s.xy;\n   return v.x + v.y;";
}, {
    readonly name: "r";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scale";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   return vec4(_c0.r * scale + offset);";
}, {
    readonly name: "g";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scale";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   return vec4(_c0.g * scale + offset);";
}, {
    readonly name: "b";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scale";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   return vec4(_c0.b * scale + offset);";
}, {
    readonly name: "a";
    readonly type: "color";
    readonly inputs: readonly [{
        readonly type: "float";
        readonly name: "scale";
        readonly default: 1;
    }, {
        readonly type: "float";
        readonly name: "offset";
        readonly default: 0;
    }];
    readonly glsl: "   return vec4(_c0.a * scale + offset);";
}];
