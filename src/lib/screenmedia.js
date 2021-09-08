"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(options) {
    return new Promise(function (resolve, reject) {
        //  async function startCapture(displayMediaOptions) {
        navigator.mediaDevices
            .getDisplayMedia(options)
            .then((stream) => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.addEventListener('loadedmetadata', () => {
                video.play();
                resolve({ video: video });
            });
        })
            .catch((err) => reject(err));
    });
}
exports.default = default_1;
