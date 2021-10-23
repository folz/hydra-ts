import { Regl, Texture2D, TextureImageData } from 'regl';
interface HydraSourceOptions {
    regl: HydraSource['regl'];
    width: HydraSource['width'];
    height: HydraSource['height'];
}
export declare class HydraSource {
    regl: Regl;
    width: number;
    height: number;
    src?: TextureImageData;
    dynamic: boolean;
    tex: Texture2D;
    constructor({ regl, width, height }: HydraSourceOptions);
    init: (opts: {
        src: HydraSource['src'];
        dynamic: boolean;
    }) => void;
    initCam: (index: number) => void;
    initVideo: (url?: string) => void;
    initImage: (url?: string) => void;
    initScreen: () => void;
    resize: (width: number, height: number) => void;
    clear: () => void;
    tick: (dt: number) => void;
    getTexture: () => Texture2D;
}
export {};
