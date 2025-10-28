export function Screen(
  options?: DisplayMediaStreamOptions,
): Promise<HTMLVideoElement> {
  return new Promise(function (resolve, reject) {
    navigator.mediaDevices
      .getDisplayMedia(options)
      .then((stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;

        video.addEventListener('loadedmetadata', () => {
          video.play();
          resolve(video);
        });
      })
      .catch((err) => reject(err));
  });
}
