/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:56 UTC
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

var fragment = "precision mediump float;\r\n\r\nvarying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvoid main(void)\r\n{\r\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\r\n\r\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\r\n\r\n    if (lum < 1.00)\r\n    {\r\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\r\n        {\r\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\r\n        }\r\n    }\r\n\r\n    if (lum < 0.75)\r\n    {\r\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\r\n        {\r\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\r\n        }\r\n    }\r\n\r\n    if (lum < 0.50)\r\n    {\r\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\r\n        {\r\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\r\n        }\r\n    }\r\n\r\n    if (lum < 0.3)\r\n    {\r\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\r\n        {\r\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\r\n        }\r\n    }\r\n}\r\n";

/**
 * A Cross Hatch effect filter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
var CrossHatchFilter = (function (superclass) {
    function CrossHatchFilter() {
        superclass.call(this, vertex, fragment);
    }

    if ( superclass ) CrossHatchFilter.__proto__ = superclass;
    CrossHatchFilter.prototype = Object.create( superclass && superclass.prototype );
    CrossHatchFilter.prototype.constructor = CrossHatchFilter;

    return CrossHatchFilter;
}(PIXI.Filter));

exports.CrossHatchFilter = CrossHatchFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=crosshatch.js.map
