/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:13 UTC
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

// var fragment = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nuniform vec2 center;\r\nuniform vec3 params; // 10.0, 0.8, 0.1\r\nuniform float time;\r\n\r\nvoid main()\r\n{\r\n    vec2 uv = vTextureCoord;\r\n    vec2 texCoord = uv;\r\n\r\n    float dist = distance(uv, center);\r\n\r\n    if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )\r\n    {\r\n        float diff = (dist - time);\r\n        float powDiff = 1.0 - pow(abs(diff*params.x), params.y);\r\n\r\n        float diffTime = diff  * powDiff;\r\n        vec2 diffUV = normalize(uv - center);\r\n        texCoord = uv + (diffUV * diffTime);\r\n    }\r\n\r\n    gl_FragColor = texture2D(uSampler, texCoord);\r\n}\r\n";

var fragment = 
`varying vec2 vTextureCoord;

uniform sampler2D uSampler;

uniform vec2 center;
uniform vec3 params; // 10.0, 0.8, 0.1
uniform float time;
void main()
{
    vec2 uv = vTextureCoord;
    vec2 texCoord = uv;
    vec2 uvc = vec2(uv[0], uv[1] / 2.0);

    float dist = distance(uvc, center);
    if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )
    {
        float diff = (dist - time);
        float powDiff = 1.0 - pow(abs(diff*params.x), params.y);
        float diffTime = diff * powDiff;
        vec2 diffUV = normalize(uvc - center);
        texCoord = uv + (diffUV * diffTime);
    }
    gl_FragColor = texture2D(uSampler, texCoord);

    //gl_FragColor = vec4(uv, 0, 1);
}`;

/**
 * The ColorMatrixFilter class lets you apply a 4x4 matrix transformation on the RGBA
 * color and alpha values of every pixel on your displayObject to produce a result
 * with a new set of RGBA color and alpha values. It's pretty powerful!
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {PIXI.Point} [center=[0.5, 0.5]] See center property
 * @param {Array<number>} [params=[10, 0.8, 0.1]] See params property
 * @param {number} [time=0] See time property
 */
var ShockwaveFilter = (function (superclass) {
    function ShockwaveFilter(center, params, time) {
        if ( center === void 0 ) center = [0.5, 0.5];
        if ( params === void 0 ) params = [10, 0.8, 0.1];
        if ( time === void 0 ) time = 0;

        superclass.call(this, vertex, fragment, {
            center: { type: 'v2', value: { x: 0.5, y: 0.5 } },
            params: { type: 'v3', value: { x: 10, y: 0.8, z: 0.1 } },
            time: { type: '1f', value: 0 }
        });

        this.center = center;
        this.params = params;
        this.time = time;
    }

    if ( superclass ) ShockwaveFilter.__proto__ = superclass;
    ShockwaveFilter.prototype = Object.create( superclass && superclass.prototype );
    ShockwaveFilter.prototype.constructor = ShockwaveFilter;

    var prototypeAccessors = { center: {},params: {},time: {} };

    /**
     * Sets the center of the shockwave in normalized screen coords. That is
     * (0,0) is the top-left and (1,1) is the bottom right.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.center.get = function () {
        return this.uniforms.center;
    };
    prototypeAccessors.center.set = function (value) {
        this.uniforms.center = value;
    };

    /**
     * Sets the params of the shockwave. These modify the look and behavior of
     * the shockwave as it ripples out.
     *
     * @member {Array<number>}
     */
    prototypeAccessors.params.get = function () {
        return this.uniforms.params;
    };
    prototypeAccessors.params.set = function (value) {
        this.uniforms.params = value;
    };

    /**
     * Sets the elapsed time of the shockwave. This controls the speed at which
     * the shockwave ripples out.
     *
     * @member {number}
     */
    prototypeAccessors.time.get = function () {
        return this.uniforms.time;
    };
    prototypeAccessors.time.set = function (value) {
        this.uniforms.time = value;
    };

    Object.defineProperties( ShockwaveFilter.prototype, prototypeAccessors );

    return ShockwaveFilter;
}(PIXI.Filter));

exports.ShockwaveFilter = ShockwaveFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=shockwave.js.map
