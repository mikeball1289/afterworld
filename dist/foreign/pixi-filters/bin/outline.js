/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:05 UTC
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

var vertex = "attribute vec2 aVertexPosition;\r\nattribute vec2 aTextureCoord;\r\n\r\nuniform mat3 projectionMatrix;\r\nvarying vec2 vTextureCoord;\r\n\r\nvoid main(void){\r\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\r\n    vTextureCoord = aTextureCoord;\r\n}\r\n";

var fragment = "varying vec2 vTextureCoord;\r\nuniform sampler2D uSampler;\r\n\r\nuniform float thickness;\r\nuniform vec4 outlineColor;\r\nuniform vec4 filterArea;\r\nuniform vec4 filterClamp;\r\nvec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);\r\n\r\nvoid main(void) {\r\n    const float PI = 3.14159265358979323846264;\r\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\r\n    vec4 curColor;\r\n    float maxAlpha = 0.;\r\n    vec2 displaced;\r\n    for (float angle = 0.; angle < PI * 2.; angle += %THICKNESS% ) {\r\n        displaced.x = vTextureCoord.x + thickness * px.x * cos(angle);\r\n        displaced.y = vTextureCoord.y + thickness * px.y * sin(angle);\r\n        curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\r\n        maxAlpha = max(maxAlpha, curColor.a);\r\n    }\r\n    float resultAlpha = max(maxAlpha, ownColor.a);\r\n    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);\r\n}\r\n";

/**
 * OutlineFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 * http://codepen.io/mishaa/pen/emGNRB
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [thickness=1] The tickness of the outline. Make it 2 times more for resolution 2
 * @param {number} [color=0x000000] The color of the glow.
 *
 * @example
 *  someSprite.shader = new OutlineFilter(9, 0xFF0000);
 */
var OutlineFilter = (function (superclass) {
    function OutlineFilter(thickness, color) {
        if ( thickness === void 0 ) thickness = 1;
        if ( color === void 0 ) color = 0x000000;

        superclass.call(this, vertex, fragment.replace(/%THICKNESS%/gi, (1.0 / thickness).toFixed(7)));
        this.thickness = thickness;
        this.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]);
        this.color = color;
    }

    if ( superclass ) OutlineFilter.__proto__ = superclass;
    OutlineFilter.prototype = Object.create( superclass && superclass.prototype );
    OutlineFilter.prototype.constructor = OutlineFilter;

    var prototypeAccessors = { color: {},thickness: {} };

    /**
     * The color of the glow.
     * @member {number}
     * @default 0x000000
     */
    prototypeAccessors.color.get = function () {
        return PIXI.utils.rgb2hex(this.uniforms.outlineColor);
    };
    prototypeAccessors.color.set = function (value) {
        PIXI.utils.hex2rgb(value, this.uniforms.outlineColor);
    };

    /**
     * The tickness of the outline. Make it 2 times more for resolution 2
     * @member {number}
     * @default 1
     */
    prototypeAccessors.thickness.get = function () {
        return this.uniforms.thickness;
    };
    prototypeAccessors.thickness.set = function (value) {
        this.uniforms.thickness = value;
    };

    Object.defineProperties( OutlineFilter.prototype, prototypeAccessors );

    return OutlineFilter;
}(PIXI.Filter));

exports.OutlineFilter = OutlineFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=outline.js.map
