/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:54 UTC
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

var fragment = "precision mediump float;\r\n\r\nvarying mediump vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform vec2 texelSize;\r\nuniform float matrix[9];\r\n\r\nvoid main(void)\r\n{\r\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\r\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\r\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\r\n\r\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\r\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\r\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\r\n\r\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\r\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\r\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\r\n\r\n   gl_FragColor =\r\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\r\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\r\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\r\n\r\n   gl_FragColor.a = c22.a;\r\n}\r\n";

/**
 * The ConvolutionFilter class applies a matrix convolution filter effect.
 * A convolution combines pixels in the input image with neighboring pixels to produce a new image.
 * A wide variety of image effects can be achieved through convolutions, including blurring, edge
 * detection, sharpening, embossing, and beveling. The matrix should be specified as a 9 point Array.
 * See http://docs.gimp.org/en/plug-in-convmatrix.html for more info.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param matrix {number[]} An array of values used for matrix transformation. Specified as a 9 point Array.
 * @param width {number} Width of the object you are transforming
 * @param height {number} Height of the object you are transforming
 */
var ConvolutionFilter = (function (superclass) {
    function ConvolutionFilter(matrix, width, height) {
        superclass.call(this, vertex, fragment);
        this.matrix = matrix;
        this.width = width;
        this.height = height;
    }

    if ( superclass ) ConvolutionFilter.__proto__ = superclass;
    ConvolutionFilter.prototype = Object.create( superclass && superclass.prototype );
    ConvolutionFilter.prototype.constructor = ConvolutionFilter;

    var prototypeAccessors = { matrix: {},width: {},height: {} };

    /**
     * An array of values used for matrix transformation. Specified as a 9 point Array.
     *
     * @member {Array<number>}
     */
    prototypeAccessors.matrix.get = function () {
        return this.uniforms.matrix;
    };
    prototypeAccessors.matrix.set = function (value) {
        this.uniforms.matrix = new Float32Array(value);
    };

    /**
     * Width of the object you are transforming
     *
     * @member {number}
     */
    prototypeAccessors.width.get = function () {
        return 1/this.uniforms.texelSize[0];
    };
    prototypeAccessors.width.set = function (value) {
        this.uniforms.texelSize[0] = 1/value;
    };

    /**
     * Height of the object you are transforming
     *
     * @member {number}
     */
    prototypeAccessors.height.get = function () {
        return 1/this.uniforms.texelSize[1];
    };
    prototypeAccessors.height.set = function (value) {
        this.uniforms.texelSize[1] = 1/value;
    };

    Object.defineProperties( ConvolutionFilter.prototype, prototypeAccessors );

    return ConvolutionFilter;
}(PIXI.Filter));

exports.ConvolutionFilter = ConvolutionFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=convolution.js.map
