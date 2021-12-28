export class Glsl {
    constructor(transformApplication) {
        this.transforms = [transformApplication];
    }
    out(output) {
        output.render(this.transforms);
    }
}
