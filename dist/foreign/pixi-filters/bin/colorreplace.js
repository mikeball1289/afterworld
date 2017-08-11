/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:52 UTC
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

var fragment = "varying vec2 vTextureCoord;\r\nuniform sampler2D texture;\r\nuniform vec3 originalColor;\r\nuniform vec3 newColor;\r\nuniform float epsilon;\r\nvoid main(void) {\r\n    vec4 currentColor = texture2D(texture, vTextureCoord);\r\n    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));\r\n    float colorDistance = length(colorDiff);\r\n    float doReplace = step(colorDistance, epsilon);\r\n    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);\r\n}\r\n";

/**
 * ColorReplaceFilter, originally by mishaa, updated by timetocode
 * http://www.html5gamedevs.com/topic/10640-outline-a-sprite-change-certain-colors/?p=69966
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number|Array<number>} [originalColor=0xFF0000] The color that will be changed, as a 3 component RGB e.g. [1.0, 1.0, 1.0]
 * @param {number|Array<number>} [newColor=0x000000] The resulting color, as a 3 component RGB e.g. [1.0, 0.5, 1.0]
 * @param {number} [epsilon=0.4] Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
 *
 * @example
 *  // replaces true red with true blue
 *  someSprite.filters = [new ColorReplaceFilter(
 *   [1, 0, 0],
 *   [0, 0, 1],
 *   0.001
 *   )];
 *  // replaces the RGB color 220, 220, 220 with the RGB color 225, 200, 215
 *  someOtherSprite.filters = [new ColorReplaceFilter(
 *   [220/255.0, 220/255.0, 220/255.0],
 *   [225/255.0, 200/255.0, 215/255.0],
 *   0.001
 *   )];
 *  // replaces the RGB color 220, 220, 220 with the RGB color 225, 200, 215
 *  someOtherSprite.filters = [new ColorReplaceFilter(0xdcdcdc, 0xe1c8d7, 0.001)];
 *
 */
var ColorReplaceFilter = (function (superclass) {
    function ColorReplaceFilter(originalColor, newColor, epsilon) {
        if ( originalColor === void 0 ) originalColor = 0xFF0000;
        if ( newColor === void 0 ) newColor = 0x000000;
        if ( epsilon === void 0 ) epsilon = 0.4;

        superclass.call(this, vertex, fragment);
        this.originalColor = originalColor;
        this.newColor = newColor;
        this.epsilon = epsilon;
    }

    if ( superclass ) ColorReplaceFilter.__proto__ = superclass;
    ColorReplaceFilter.prototype = Object.create( superclass && superclass.prototype );
    ColorReplaceFilter.prototype.constructor = ColorReplaceFilter;

    var prototypeAccessors = { originalColor: {},newColor: {},epsilon: {} };

    /**
     * The color that will be changed, as a 3 component RGB e.g. [1.0, 1.0, 1.0]
     * @member {number|Array<number>}
     * @default 0xFF0000
     */
    prototypeAccessors.originalColor.set = function (value) {
        var arr = this.uniforms.originalColor;
        if (typeof value === 'number') {
            PIXI.utils.hex2rgb(value, arr);
            this._originalColor = value;
        }
        else {
            arr[0] = value[0];
            arr[1] = value[1];
            arr[2] = value[2];
            this._originalColor = PIXI.utils.rgb2hex(arr);
        }
    };
    prototypeAccessors.originalColor.get = function () {
        return this._originalColor;
    };

    /**
     * The resulting color, as a 3 component RGB e.g. [1.0, 0.5, 1.0]
     * @member {number|Array<number>}
     * @default 0x000000
     */
    prototypeAccessors.newColor.set = function (value) {
        var arr = this.uniforms.newColor;
        if (typeof value === 'number') {
            PIXI.utils.hex2rgb(value, arr);
            this._newColor = value;
        }
        else {
            arr[0] = value[0];
            arr[1] = value[1];
            arr[2] = value[2];
            this._newColor = PIXI.utils.rgb2hex(arr);
        }
    };
    prototypeAccessors.newColor.get = function () {
        return this._newColor;
    };

    /**
     * Tolerance/sensitivity of the floating-point comparison between colors (lower = more exact, higher = more inclusive)
     * @member {number}
     * @default 0.4
     */
    prototypeAccessors.epsilon.set = function (value) {
        this.uniforms.epsilon = value;
    };
    prototypeAccessors.epsilon.get = function () {
        return this.uniforms.epsilon;
    };

    Object.defineProperties( ColorReplaceFilter.prototype, prototypeAccessors );

    return ColorReplaceFilter;
}(PIXI.Filter));

exports.ColorReplaceFilter = ColorReplaceFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=colorreplace.js.map
