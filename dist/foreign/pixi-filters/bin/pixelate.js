/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:07 UTC
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

var fragment = "precision mediump float;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform vec2 size;\r\nuniform sampler2D uSampler;\r\n\r\nuniform vec4 filterArea;\r\n\r\nvec2 mapCoord( vec2 coord )\r\n{\r\n    coord *= filterArea.xy;\r\n    coord += filterArea.zw;\r\n\r\n    return coord;\r\n}\r\n\r\nvec2 unmapCoord( vec2 coord )\r\n{\r\n    coord -= filterArea.zw;\r\n    coord /= filterArea.xy;\r\n\r\n    return coord;\r\n}\r\n\r\nvec2 pixelate(vec2 coord, vec2 size)\r\n{\r\n\treturn floor( coord / size ) * size;\r\n}\r\n\r\nvoid main(void)\r\n{\r\n    vec2 coord = mapCoord(vTextureCoord);\r\n\r\n    coord = pixelate(coord, size);\r\n\r\n    coord = unmapCoord(coord);\r\n\r\n    gl_FragColor = texture2D(uSampler, coord);\r\n}\r\n";

/**
 * This filter applies a pixelate effect making display objects appear 'blocky'.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {PIXI.Point|Array<number>|number} [size=10] Either the width/height of the size of the pixels, or square size
 */
var PixelateFilter = (function (superclass) {
    function PixelateFilter(size) {
        if ( size === void 0 ) size = 10;

        superclass.call(this, vertex, fragment);
        this.size = size; 
    }

    if ( superclass ) PixelateFilter.__proto__ = superclass;
    PixelateFilter.prototype = Object.create( superclass && superclass.prototype );
    PixelateFilter.prototype.constructor = PixelateFilter;

    var prototypeAccessors = { size: {} };

    /**
     * This a point that describes the size of the blocks.
     * x is the width of the block and y is the height.
     *
     * @member {PIXI.Point|Array<number>|number}
     * @default 10
     */
    prototypeAccessors.size.get = function () {
        return this.uniforms.size;
    };
    prototypeAccessors.size.set = function (value) {
        if (typeof value === 'number') {
            value = [value, value];
        }
        this.uniforms.size = value;
    };

    Object.defineProperties( PixelateFilter.prototype, prototypeAccessors );

    return PixelateFilter;
}(PIXI.Filter));

exports.PixelateFilter = PixelateFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=pixelate.js.map
