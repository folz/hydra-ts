export function Screen(options?: DisplayMediaStreamConstraints) {
  return new Promise<{ video: HTMLVideoElement }>(function (resolve, reject) {
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
