import { Regl, Texture2D } from 'regl';
interface HydraSourceOptions {
    regl: HydraSource['regl'];
    width: HydraSource['width'];
    height: HydraSource['height'];
    pb: HydraSource['pb'];
    label: HydraSource['label'];
}
export declare class HydraSource {
    regl: Regl;
    width: number;
    height: number;
    pb: any;
    label: string;
    src: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | CanvasRenderingContext2D | null;
    dynamic: boolean;
    tex: Texture2D;
    constructor({ regl, width, height, pb, label }: HydraSourceOptions);
    init(opts: {
        src: HydraSource['src'];
        dynamic: boolean;
    }): void;
    initCam(index: number): void;
    initVideo(url?: string): void;
    initImage(url?: string): void;
    initStream(streamName: string): void;
    initScreen(): void;
    resize(width: number, height: number): void;
    clear(): void;
    tick(dt?: number): void;
    getTexture(): Texture2D;
}
export {};
