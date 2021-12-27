export function Webcam(deviceId) {
    return navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => devices.filter((devices) => devices.kind === 'videoinput'))
        .then((cameras) => {
        let constraints = {
            audio: false,
            video: true,
        };
        if (cameras[deviceId]) {
            constraints['video'] = {
                deviceId: {
                    exact: cameras[deviceId].deviceId,
                },
            };
        }
        return window.navigator.mediaDevices.getUserMedia(constraints);
    })
        .then((stream) => {
        const video = document.createElement('video');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.srcObject = stream;
        return new Promise((resolve, _reject) => {
            video.addEventListener('loadedmetadata', () => {
                video.play().then(() => resolve(video));
            });
        });
    });
}
