export declare class VideoRecorder {
    mediaSource: MediaSource;
    stream: MediaStream;
    output: HTMLVideoElement;
    sourceBuffer?: SourceBuffer;
    recordedBlobs: Blob[];
    mediaRecorder?: MediaRecorder;
    constructor(stream: MediaStream);
    start(): void;
    stop(): void;
    _handleStop: () => void;
    _handleDataAvailable: (event: BlobEvent) => void;
}
