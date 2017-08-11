/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:09 UTC
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

var fragment = "precision mediump float;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform vec4 filterArea;\r\nuniform vec2 red;\r\nuniform vec2 green;\r\nuniform vec2 blue;\r\n\r\nvoid main(void)\r\n{\r\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;\r\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;\r\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;\r\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\r\n}\r\n";

/**
 * An RGB Split Filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {PIXI.Point} [red=[-10,0]] Red channel offset
 * @param {PIXI.Point} [green=[0, 10]] Green channel offset
 * @param {PIXI.Point} [blue=[0, 0]] Blue channel offset
 */
var RGBSplitFilter = (function (superclass) {
    function RGBSplitFilter(red, green, blue) {
        if ( red === void 0 ) red = [-10, 0];
        if ( green === void 0 ) green = [0, 10];
        if ( blue === void 0 ) blue = [0, 0];

        superclass.call(this, vertex, fragment);
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    if ( superclass ) RGBSplitFilter.__proto__ = superclass;
    RGBSplitFilter.prototype = Object.create( superclass && superclass.prototype );
    RGBSplitFilter.prototype.constructor = RGBSplitFilter;

    var prototypeAccessors = { red: {},green: {},blue: {} };

    /**
     * Red channel offset.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.red.get = function () {
        return this.uniforms.red;
    };
    prototypeAccessors.red.set = function (value) {
        this.uniforms.red = value;
    };

    /**
     * Green channel offset.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.green.get = function () {
        return this.uniforms.green;
    };
    prototypeAccessors.green.set = function (value) {
        this.uniforms.green = value;
    };

    /**
     * Blue offset.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.blue.get = function () {
        return this.uniforms.blue;
    };
    prototypeAccessors.blue.set = function (value) {
        this.uniforms.blue = value;
    };

    Object.defineProperties( RGBSplitFilter.prototype, prototypeAccessors );

    return RGBSplitFilter;
}(PIXI.Filter));

exports.RGBSplitFilter = RGBSplitFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=rgb.js.map
