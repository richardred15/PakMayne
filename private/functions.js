function randFloat(min, max) {
    return Math.random() * (max - min) + min; //(Math.random() * max) + min;
}

function randFixed(min, max, digits) {
    return randFloat(min, max).toFixed(digits);
}

function randInt(min, max) {
    return Math.floor(randFloat(min, max));
}