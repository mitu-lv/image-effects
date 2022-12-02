import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

function Entry() {
    return (
        <App />
    );
}

const root = ReactDOM.render(<Entry />, document.getElementById('root'));

function receiveMessage(event) {
    const close = event.data.close;
    if (close) {
        ImageEffects.getOutputImage().then((image) => {
            window.parent.postMessage({
                kind: "ImageEffectsResult",
                image: image.src
            }, "*");
        });
        return;
    }

    const image = event.data.image;
    if (image) {
        if (image.startsWith("http")) {
            ImageEffects.setInputImageUrl(image, event.data.size);
            return;
        }
        ImageEffects.setInputImage(image, event.data.size);
        return;
    }

    const effects = event.data.effects;
    if (effects) {
        ImageEffects.setEffects(effects);
        return;
    }
}

window.addEventListener("message", receiveMessage, false);

window.parent.postMessage({kind: "ImageEffectsReady"}, "*");
