import { compileTransformApplicationsWithContext } from './compiler/compileTransformApplicationsWithContext';
export class Glsl {
    constructor(transformApplication) {
        this.transforms = [];
        this.defaultUniforms = transformApplication.defaultUniforms;
        this.precision = transformApplication.precision;
        this.transforms.push(transformApplication);
    }
    do(...transforms) {
        this.transforms.push(...transforms);
        return this;
    }
    skip(...transforms) {
        return this;
    }
    out(output) {
        const glsl = this.glsl();
        try {
            output.render(glsl);
        }
        catch (error) {
            console.log('shader could not compile', error);
        }
    }
    glsl() {
        if (this.transforms.length > 0) {
            const context = {
                defaultUniforms: this.defaultUniforms,
                precision: this.precision,
            };
            return [
                compileTransformApplicationsWithContext(this.transforms, context),
            ];
        }
        return [];
    }
}
