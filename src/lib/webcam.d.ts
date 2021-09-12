declare function Webcam(deviceId: number): Promise<{
    video: HTMLVideoElement;
}>;
export default Webcam;
