
export default function loadImage(url, anonymous = false) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        // To avoid tainting canvas
        // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
        // Needs images to be served with CORS header
        if (anonymous) {
            image.crossOrigin = 'anonymous';
        }
        image.onload = function() {
            resolve(image);
        };
        image.onerror = reject;
        image.src = url;
    });
}
