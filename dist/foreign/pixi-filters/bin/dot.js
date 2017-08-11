/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:58 UTC
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

var fragment = "precision mediump float;\r\n\r\nvarying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nuniform vec4 filterArea;\r\nuniform sampler2D uSampler;\r\n\r\nuniform float angle;\r\nuniform float scale;\r\n\r\nfloat pattern()\r\n{\r\n   float s = sin(angle), c = cos(angle);\r\n   vec2 tex = vTextureCoord * filterArea.xy;\r\n   vec2 point = vec2(\r\n       c * tex.x - s * tex.y,\r\n       s * tex.x + c * tex.y\r\n   ) * scale;\r\n   return (sin(point.x) * sin(point.y)) * 4.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n   vec4 color = texture2D(uSampler, vTextureCoord);\r\n   float average = (color.r + color.g + color.b) / 3.0;\r\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\r\n}\r\n";

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 * original filter: https://github.com/evanw/glfx.js/blob/master/src/filters/fun/dotscreen.js
 */

/**
 * This filter applies a dotscreen effect making display objects appear to be made out of
 * black and white halftone dots like an old printer.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [scale=1] The scale of the effect.
 * @param {number} [angle=5] The radius of the effect.
 */
var DotFilter = (function (superclass) {
    function DotFilter(scale, angle) {
        if ( scale === void 0 ) scale = 1;
        if ( angle === void 0 ) angle = 5;

        superclass.call(this, vertex, fragment);
        this.scale = scale;
        this.angle = angle;
    }

    if ( superclass ) DotFilter.__proto__ = superclass;
    DotFilter.prototype = Object.create( superclass && superclass.prototype );
    DotFilter.prototype.constructor = DotFilter;

    var prototypeAccessors = { scale: {},angle: {} };

    /**
     * The scale of the effect.
     * @member {number}
     * @default 1
     */
    prototypeAccessors.scale.get = function () {
        return this.uniforms.scale;
    };
    prototypeAccessors.scale.set = function (value) {
        this.uniforms.scale = value;
    };

    /**
     * The radius of the effect.
     * @member {number}
     * @default 5
     */
    prototypeAccessors.angle.get = function () {
        return this.uniforms.angle;
    };
    prototypeAccessors.angle.set = function (value) {
        this.uniforms.angle = value;
    };

    Object.defineProperties( DotFilter.prototype, prototypeAccessors );

    return DotFilter;
}(PIXI.Filter));

exports.DotFilter = DotFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=dot.js.map
