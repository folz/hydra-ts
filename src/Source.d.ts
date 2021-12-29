import { Regl, Texture2D, TextureImageData } from 'regl';
interface HydraSourceOptions {
    regl: Source['regl'];
}
export declare class Source {
    regl: Regl;
    src?: TextureImageData;
    dynamic: boolean;
    tex: Texture2D;
    constructor({ regl }: HydraSourceOptions);
    init: (opts: {
        src: Source['src'];
        dynamic: boolean;
    }) => void;
    initCam: (index: number) => void;
    initVideo: (url?: string) => void;
    initImage: (url?: string) => void;
    initScreen: () => void;
    clear: () => void;
    tick: (dt: number) => void;
    getTexture: () => Texture2D;
}
export {};
