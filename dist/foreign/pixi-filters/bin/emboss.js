/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:02 UTC
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

var fragment = "precision mediump float;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform float strength;\r\nuniform vec4 filterArea;\r\n\r\n\r\nvoid main(void)\r\n{\r\n\tvec2 onePixel = vec2(1.0 / filterArea);\r\n\r\n\tvec4 color;\r\n\r\n\tcolor.rgb = vec3(0.5);\r\n\r\n\tcolor -= texture2D(uSampler, vTextureCoord - onePixel) * strength;\r\n\tcolor += texture2D(uSampler, vTextureCoord + onePixel) * strength;\r\n\r\n\tcolor.rgb = vec3((color.r + color.g + color.b) / 3.0);\r\n\r\n\tfloat alpha = texture2D(uSampler, vTextureCoord).a;\r\n\r\n\tgl_FragColor = vec4(color.rgb * alpha, alpha);\r\n}\r\n";

/**
 * An RGB Split Filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [strength=5] Strength of the emboss.
 */
var EmbossFilter = (function (superclass) {
    function EmbossFilter(strength){
        if ( strength === void 0 ) strength = 5;

        superclass.call(this, vertex, fragment);
        this.strength = strength;
    }

    if ( superclass ) EmbossFilter.__proto__ = superclass;
    EmbossFilter.prototype = Object.create( superclass && superclass.prototype );
    EmbossFilter.prototype.constructor = EmbossFilter;

    var prototypeAccessors = { strength: {} };

    /**
     * Strength of emboss.
     *
     * @member {number}
     */
    prototypeAccessors.strength.get = function () {
        return this.uniforms.strength;
    };
    prototypeAccessors.strength.set = function (value) {
        this.uniforms.strength = value;
    };

    Object.defineProperties( EmbossFilter.prototype, prototypeAccessors );

    return EmbossFilter;
}(PIXI.Filter));

exports.EmbossFilter = EmbossFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=emboss.js.map
