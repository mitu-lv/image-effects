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
        ImageEffects.getImageOutput().then((image) => {
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
            ImageEffects.setInputImageUrl(image);
            return;
        }
        ImageEffects.setInputImage(image);
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
