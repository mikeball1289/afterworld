/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:03 UTC
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

var fragment = "varying vec2 vTextureCoord;\r\nvarying vec4 vColor;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nuniform float distance;\r\nuniform float outerStrength;\r\nuniform float innerStrength;\r\nuniform vec4 glowColor;\r\nuniform vec4 filterArea;\r\nuniform vec4 filterClamp;\r\nvec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);\r\n\r\nvoid main(void) {\r\n    const float PI = 3.14159265358979323846264;\r\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\r\n    vec4 curColor;\r\n    float totalAlpha = 0.0;\r\n    float maxTotalAlpha = 0.0;\r\n    float cosAngle;\r\n    float sinAngle;\r\n    vec2 displaced;\r\n    for (float angle = 0.0; angle <= PI * 2.0; angle += %QUALITY_DIST%) {\r\n       cosAngle = cos(angle);\r\n       sinAngle = sin(angle);\r\n       for (float curDistance = 1.0; curDistance <= %DIST%; curDistance++) {\r\n           displaced.x = vTextureCoord.x + cosAngle * curDistance * px.x;\r\n           displaced.y = vTextureCoord.y + sinAngle * curDistance * px.y;\r\n           curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\r\n           totalAlpha += (distance - curDistance) * curColor.a;\r\n           maxTotalAlpha += (distance - curDistance);\r\n       }\r\n    }\r\n    maxTotalAlpha = max(maxTotalAlpha, 0.0001);\r\n\r\n    ownColor.a = max(ownColor.a, 0.0001);\r\n    ownColor.rgb = ownColor.rgb / ownColor.a;\r\n    float outerGlowAlpha = (totalAlpha / maxTotalAlpha)  * outerStrength * (1. - ownColor.a);\r\n    float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * innerStrength * ownColor.a;\r\n    float resultAlpha = (ownColor.a + outerGlowAlpha);\r\n    gl_FragColor = vec4(mix(mix(ownColor.rgb, glowColor.rgb, innerGlowAlpha / ownColor.a), glowColor.rgb, outerGlowAlpha / resultAlpha) * resultAlpha, resultAlpha);\r\n}\r\n";

/**
 * GlowFilter, originally by mishaa
 * http://www.html5gamedevs.com/topic/12756-glow-filter/?hl=mishaa#entry73578
 * http://codepen.io/mishaa/pen/raKzrm
 *
 * @class
 * 
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [distance=10] The distance of the glow. Make it 2 times more for resolution=2. It cant be changed after filter creation
 * @param {number} [outerStrength=4] The strength of the glow outward from the edge of the sprite.
 * @param {number} [innerStrength=0] The strength of the glow inward from the edge of the sprite.
 * @param {number} [color=0xffffff] The color of the glow.
 * @param {number} [quality=0.1] A number between 0 and 1 that describes the quality of the glow.
 *
 * @example
 *  someSprite.filters = [
 *      new GlowFilter(15, 2, 1, 0xFF0000, 0.5)
 *  ];
 */
var GlowFilter = (function (superclass) {
    function GlowFilter(distance, outerStrength, innerStrength, color, quality) {
        if ( distance === void 0 ) distance = 10;
        if ( outerStrength === void 0 ) outerStrength = 4;
        if ( innerStrength === void 0 ) innerStrength = 0;
        if ( color === void 0 ) color = 0xffffff;
        if ( quality === void 0 ) quality = 0.1;

        superclass.call(this, vertex, fragment
            .replace(/%QUALITY_DIST%/gi, '' + (1 / quality / distance).toFixed(7))
            .replace(/%DIST%/gi, '' + distance.toFixed(7)));

        this.uniforms.glowColor = new Float32Array([0, 0, 0, 1]);
        this.distance = distance;
        this.color = color;
        this.outerStrength = outerStrength;
        this.innerStrength = innerStrength;
    }

    if ( superclass ) GlowFilter.__proto__ = superclass;
    GlowFilter.prototype = Object.create( superclass && superclass.prototype );
    GlowFilter.prototype.constructor = GlowFilter;

    var prototypeAccessors = { color: {},distance: {},outerStrength: {},innerStrength: {} };

    /**
     * The color of the glow.
     * @member {number}
     * @default 0xFFFFFF
     */
    prototypeAccessors.color.get = function () {
        return PIXI.utils.rgb2hex(this.uniforms.glowColor);
    };
    prototypeAccessors.color.set = function (value) {
        PIXI.utils.hex2rgb(value, this.uniforms.glowColor);
    };

    /**
     * The distance of the glow. Make it 2 times more for resolution=2. It cant be changed after filter creation
     * @member {number}
     * @default 10
     */
    prototypeAccessors.distance.get = function () {
        return this.uniforms.distance;
    };
    prototypeAccessors.distance.set = function (value) {
        this.uniforms.distance = value;
    };

    /**
     * The strength of the glow outward from the edge of the sprite.
     * @member {number}
     * @default 4
     */
    prototypeAccessors.outerStrength.get = function () {
        return this.uniforms.outerStrength;
    };
    prototypeAccessors.outerStrength.set = function (value) {
        this.uniforms.outerStrength = value;
    };

    /**
     * The strength of the glow inward from the edge of the sprite.
     * @member {number}
     * @default 0
     */
    prototypeAccessors.innerStrength.get = function () {
        return this.uniforms.innerStrength;
    };
    prototypeAccessors.innerStrength.set = function (value) {
        this.uniforms.innerStrength = value;
    };

    Object.defineProperties( GlowFilter.prototype, prototypeAccessors );

    return GlowFilter;
}(PIXI.Filter));

exports.GlowFilter = GlowFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=glow.js.map
