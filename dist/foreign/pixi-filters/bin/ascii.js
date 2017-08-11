/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:47 UTC
 *
 * pixi-filters is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.__pixiFilters = {})));
}(this, (function (exports) { 'use strict';

if (typeof PIXI.Filter === 'undefined') { throw 'PixiJS is required'; }

var vertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void)\r\n{\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n    vTextureCoord = aTextureCoord;\r\n}";

var fragment = "varying vec2 vTextureCoord;\r\n\r\nuniform vec4 filterArea;\r\nuniform float pixelSize;\r\nuniform sampler2D uSampler;\r\n\r\nvec2 mapCoord( vec2 coord )\r\n{\r\n    coord *= filterArea.xy;\r\n    coord += filterArea.zw;\r\n\r\n    return coord;\r\n}\r\n\r\nvec2 unmapCoord( vec2 coord )\r\n{\r\n    coord -= filterArea.zw;\r\n    coord /= filterArea.xy;\r\n\r\n    return coord;\r\n}\r\n\r\nvec2 pixelate(vec2 coord, vec2 size)\r\n{\r\n    return floor( coord / size ) * size;\r\n}\r\n\r\nvec2 getMod(vec2 coord, vec2 size)\r\n{\r\n    return mod( coord , size) / size;\r\n}\r\n\r\nfloat character(float n, vec2 p)\r\n{\r\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\r\n    if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)\r\n    {\r\n        if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\r\n    }\r\n    return 0.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec2 coord = mapCoord(vTextureCoord);\r\n\r\n    // get the rounded color..\r\n    vec2 pixCoord = pixelate(coord, vec2(pixelSize));\r\n    pixCoord = unmapCoord(pixCoord);\r\n\r\n    vec4 color = texture2D(uSampler, pixCoord);\r\n\r\n    // determine the character to use\r\n    float gray = (color.r + color.g + color.b) / 3.0;\r\n\r\n    float n =  65536.0;             // .\r\n    if (gray > 0.2) n = 65600.0;    // :\r\n    if (gray > 0.3) n = 332772.0;   // *\r\n    if (gray > 0.4) n = 15255086.0; // o\r\n    if (gray > 0.5) n = 23385164.0; // &\r\n    if (gray > 0.6) n = 15252014.0; // 8\r\n    if (gray > 0.7) n = 13199452.0; // @\r\n    if (gray > 0.8) n = 11512810.0; // #\r\n\r\n    // get the mod..\r\n    vec2 modd = getMod(coord, vec2(pixelSize));\r\n\r\n    gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);\r\n\r\n}";

// TODO (cengler) - The Y is flipped in this shader for some reason.

/**
 * @author Vico @vicocotea
 * original shader : https://www.shadertoy.com/view/lssGDj by @movAX13h
 */

/**
 * An ASCII filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [size=8] Size of the font
 */
var AsciiFilter = (function (superclass) {
    function AsciiFilter(size) {
        if ( size === void 0 ) size = 8;

        superclass.call(this, vertex, fragment);
        this.size = size;
    }

    if ( superclass ) AsciiFilter.__proto__ = superclass;
    AsciiFilter.prototype = Object.create( superclass && superclass.prototype );
    AsciiFilter.prototype.constructor = AsciiFilter;

    var prototypeAccessors = { size: {} };

    /**
     * The pixel size used by the filter.
     *
     * @member {number}
     */
    prototypeAccessors.size.get = function () {
        return this.uniforms.pixelSize;
    };
    prototypeAccessors.size.set = function (value) {
        this.uniforms.pixelSize = value;
    };

    Object.defineProperties( AsciiFilter.prototype, prototypeAccessors );

    return AsciiFilter;
}(PIXI.Filter));

exports.AsciiFilter = AsciiFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=ascii.js.map
