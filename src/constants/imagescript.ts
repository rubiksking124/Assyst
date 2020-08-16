export const injectedCode: string = `Number.prototype.toRgba = function() {
    p = {};
    p.r = this >> 24 & 0xff;
    p.g = this >> 16 & 0xff;
    p.b = this >> 8 & 0xff;
    p.a = this & 0xff;
    return p;
}
const checkBounds = (x, y, w, h) => x >= 1 && y >= 1 && x <= w && y <= h
`