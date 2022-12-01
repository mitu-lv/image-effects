interface BorderRadius {
    rx: number;
    ry: number;
}

const PROPORTION = 200; // to turn value in the range of [0, 100] to [0, 0.5] - max border radius percentage

export function calculateBorderSizes(width: number, height: number, scale: number, percentage: number): BorderRadius {
    const maxProportion = 0.5 * Math.min(width, height) / Math.max(width, height);
    const proportion = percentage / PROPORTION;
    if (width > height) {
        return {
            rx: scale * width * proportion,
            ry: scale * width * (proportion < maxProportion ? proportion : maxProportion),
        };
    }
    return {
        rx: scale * height * (proportion < maxProportion ? proportion : maxProportion),
        ry: scale * height * proportion,
    };
}
