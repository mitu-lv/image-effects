import React, {useState, useEffect} from 'react';
import Image from './Image/Image.react';
import {fromJS} from 'immutable';
import './App.css';
import loadImage from './loadImage';


function svgToDataUrl(svg) {
    return `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`;
}

function imageToDataUrl(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return { dataUrl: canvas.toDataURL('image/png', 1.0), width: image.width, height: image.height };
}

async function imageUrlToDataUrl(url) {
    const image = await loadImage(url, true);
    return imageToDataUrl(image);
}

async function getOutputImage() {
        const svgElement = document.getElementsByClassName("svgBlock")[0];
        const svgUrl = svgToDataUrl(svgElement);
        const image = await loadImage(svgUrl);
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.clientWidth;
        canvas.height = svgElement.clientHeight;
        canvas.getContext('2d').drawImage(image, 0, 0, svgElement.clientWidth, svgElement.clientHeight);
        // canvas.classList.add('absi');
        // document.body.appendChild(canvas);

        return await loadImage(canvas.toDataURL(`image/png`, 1.0));
}

function exposeApi(api) {
    window.ImageEffects = api;
}


export function App() {
    const [props, setEffects] = useState({});
    const [image, setImageData] = useState({dataUrl: null, width: 0, height: 0});


    function setInputImage(image) {
        setImageData(imageToDataUrl(image));
    }

    async function setInputImageUrl(url) {
        const image = await imageUrlToDataUrl(url);
        setImageData(image);
    }

    useEffect(() => {
        exposeApi({
            setEffects: setEffects,
            setInputImage: setInputImage,
            setInputImageUrl: setInputImageUrl,
            getOutputImage: getOutputImage,
        });
    }, []);

    if (!image.dataUrl) {
        return null;
    }

    return (
        <Image
            id="image-effect"
            url={image.dataUrl}
            width={image.width}
            height={image.height}
            filters={fromJS(props.filters)}
            opacity={props.opacity}
            crop={fromJS(props.crop)}
            scaleX={1}
            scaleY={1}
        />
    );
}
