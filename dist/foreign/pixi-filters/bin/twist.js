/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:16 UTC
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

var fragment = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform float radius;\r\nuniform float angle;\r\nuniform vec2 offset;\r\nuniform vec4 filterArea;\r\n\r\nvec2 mapCoord( vec2 coord )\r\n{\r\n    coord *= filterArea.xy;\r\n    coord += filterArea.zw;\r\n\r\n    return coord;\r\n}\r\n\r\nvec2 unmapCoord( vec2 coord )\r\n{\r\n    coord -= filterArea.zw;\r\n    coord /= filterArea.xy;\r\n\r\n    return coord;\r\n}\r\n\r\nvec2 twist(vec2 coord)\r\n{\r\n    coord -= offset;\r\n\r\n    float dist = length(coord);\r\n\r\n    if (dist < radius)\r\n    {\r\n        float ratioDist = (radius - dist) / radius;\r\n        float angleMod = ratioDist * ratioDist * angle;\r\n        float s = sin(angleMod);\r\n        float c = cos(angleMod);\r\n        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\r\n    }\r\n\r\n    coord += offset;\r\n\r\n    return coord;\r\n}\r\n\r\nvoid main(void)\r\n{\r\n\r\n    vec2 coord = mapCoord(vTextureCoord);\r\n\r\n    coord = twist(coord);\r\n\r\n    coord = unmapCoord(coord);\r\n\r\n    gl_FragColor = texture2D(uSampler, coord );\r\n\r\n}\r\n";

/**
 * This filter applies a twist effect making display objects appear twisted in the given direction.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [radius=200] The radius of the twist.
 * @param {number} [angle=4] The angle of the twist.
 * @param {number} [padding=20] Padding for filter area.
 */
var TwistFilter = (function (superclass) {
    function TwistFilter(radius, angle, padding) {
        if ( radius === void 0 ) radius = 200;
        if ( angle === void 0 ) angle = 4;
        if ( padding === void 0 ) padding = 20;

        superclass.call(this, vertex, fragment);

        this.radius = radius;
        this.angle = angle;
        this.padding = padding;
    }

    if ( superclass ) TwistFilter.__proto__ = superclass;
    TwistFilter.prototype = Object.create( superclass && superclass.prototype );
    TwistFilter.prototype.constructor = TwistFilter;

    var prototypeAccessors = { offset: {},radius: {},angle: {} };

    /**
     * This point describes the the offset of the twist.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.offset.get = function () {
        return this.uniforms.offset;
    };
    prototypeAccessors.offset.set = function (value) {
        this.uniforms.offset = value;
    };

    /**
     * The radius of the twist.
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
     * The angle of the twist.
     *
     * @member {number}
     */
    prototypeAccessors.angle.get = function () {
        return this.uniforms.angle;
    };
    prototypeAccessors.angle.set = function (value) {
        this.uniforms.angle = value;
    };

    Object.defineProperties( TwistFilter.prototype, prototypeAccessors );

    return TwistFilter;
}(PIXI.Filter));

exports.TwistFilter = TwistFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=twist.js.map
