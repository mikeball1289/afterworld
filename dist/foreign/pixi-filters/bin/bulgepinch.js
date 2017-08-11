/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:50 UTC
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

var fragment = "uniform float radius;\r\nuniform float strength;\r\nuniform vec2 center;\r\nuniform sampler2D uSampler;\r\nuniform vec4 dimensions;\r\nvarying vec2 vTextureCoord;\r\nvoid main()\r\n{\r\n    vec2 coord = vTextureCoord * dimensions.xy;\r\n    coord -= center;\r\n    float distance = length(coord);\r\n    if (distance < radius) {\r\n        float percent = distance / radius;\r\n        if (strength > 0.0) {\r\n            coord *= mix(1.0, smoothstep(0.0, radius /     distance, percent), strength * 0.75);\r\n        } else {\r\n            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\r\n        }\r\n    }\r\n    coord += center;\r\n    gl_FragColor = texture2D(uSampler, coord / dimensions.xy);\r\n    vec2 clampedCoord = clamp(coord, vec2(0.0), dimensions.xy);\r\n    if (coord != clampedCoord) {\r\n    gl_FragColor.a *= max(0.0, 1.0 - length(coord - clampedCoord));\r\n    }\r\n}\r\n";

/**
 * @author Julien CLEREL @JuloxRox
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/warp/bulgepinch.js by Evan Wallace : http://madebyevan.com/
 */
 
/**
 * Bulges or pinches the image in a circle.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {PIXI.Point|Array<number>} [center=[0,0]] The x and y coordinates of the center of the circle of effect.
 * @param {number} [radius=100] The radius of the circle of effect.
 * @param {number} [strength=1] -1 to 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
 */
var BulgePinchFilter = (function (superclass) {
    function BulgePinchFilter(center, radius, strength) {
        superclass.call(this, vertex, fragment);
        this.center = center || [0.5, 0.5];
        this.radius = radius || 100;
        this.strength = strength || 1;
    }

    if ( superclass ) BulgePinchFilter.__proto__ = superclass;
    BulgePinchFilter.prototype = Object.create( superclass && superclass.prototype );
    BulgePinchFilter.prototype.constructor = BulgePinchFilter;

    var prototypeAccessors = { radius: {},strength: {},center: {} };

    /**
     * The radius of the circle of effect.
     *
     * @member {number}
     */
    prototypeAccessors.radius.get = function () {
        return this.uniforms.radius;
    };
    prototypeAccessors.radius.set = function (value) {
        this.uniforms.radius = value;
    };

    /**
     * The strength of the effect. -1 to 1 (-1 is strong pinch, 0 is no effect, 1 is strong bulge)
     *
     * @member {number}
     */
    prototypeAccessors.strength.get = function () {
        return this.uniforms.strength;
    };
    prototypeAccessors.strength.set = function (value) {
        this.uniforms.strength = value;
    };

    /**
     * The x and y coordinates of the center of the circle of effect.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.center.get = function () {
        return this.uniforms.center;
    };
    prototypeAccessors.center.set = function (value) {
        this.uniforms.center = value;
    };

    Object.defineProperties( BulgePinchFilter.prototype, prototypeAccessors );

    return BulgePinchFilter;
}(PIXI.Filter));

exports.BulgePinchFilter = BulgePinchFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=bulgepinch.js.map
