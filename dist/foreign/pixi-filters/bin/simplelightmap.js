/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:11 UTC
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

var vertex = "precision mediump float;\r\n\r\nvarying vec2 vTextureCoord;\r\nuniform sampler2D uSampler;\r\n\r\nuniform float thickness;\r\nuniform vec4 outlineColor;\r\nuniform float pixelWidth;\r\nuniform float pixelHeight;\r\nvec2 px = vec2(pixelWidth, pixelHeight);\r\n\r\nvoid main(void) {\r\n    const float PI = 3.14159265358979323846264;\r\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\r\n    vec4 curColor;\r\n    float maxAlpha = 0.;\r\n    for (float angle = 0.; angle < PI * 2.; angle +=  + (1 / thickness).toFixed(7) + ) {\r\n        curColor = texture2D(uSampler, vec2(vTextureCoord.x + thickness * px.x * cos(angle), vTextureCoord.y + thickness * px.y * sin(angle)));\r\n        maxAlpha = max(maxAlpha, curColor.a);\r\n    }\r\n    float resultAlpha = max(maxAlpha, ownColor.a);\r\n    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);\r\n}\r\n";

var fragment = "varying vec4 vColor;\r\nvarying vec2 vTextureCoord;\r\nuniform sampler2D u_texture; //diffuse map\r\nuniform sampler2D u_lightmap;   //light map\r\nuniform vec2 resolution; //resolution of screen\r\nuniform vec4 ambientColor; //ambient RGB, alpha channel is intensity\r\nvoid main() {\r\n    vec4 diffuseColor = texture2D(u_texture, vTextureCoord);\r\n    vec2 lighCoord = (gl_FragCoord.xy / resolution.xy);\r\n    vec4 light = texture2D(u_lightmap, vTextureCoord);\r\n    vec3 ambient = ambientColor.rgb * ambientColor.a;\r\n    vec3 intensity = ambient + light.rgb;\r\n    vec3 finalColor = diffuseColor.rgb * intensity;\r\n    gl_FragColor = vColor * vec4(finalColor, diffuseColor.a);\r\n}\r\n";

/**
* SimpleLightmap, originally by Oza94
* http://www.html5gamedevs.com/topic/20027-pixijs-simple-lightmapping/
* http://codepen.io/Oza94/pen/EPoRxj
*
* @class
* @extends PIXI.Filter
* @memberof PIXI.filters
* @param {PIXI.Texture} lightmapTexture a texture where your lightmap is rendered
* @param {Array<number>} ambientColor An RGBA array of the ambient color
* @param {Array<number>} [resolution=[1, 1]] An array for X/Y resolution
*
* @example
*  var lightmapTex = new PIXI.RenderTexture(renderer, 400, 300);
*
*  // ... render lightmap on lightmapTex
*
*  stageContainer.filters = [
*    new SimpleLightmapFilter(lightmapTex, [0.3, 0.3, 0.7, 0.5], [1.0, 1.0])
*  ];
*/
var SimpleLightmapFilter = (function (superclass) {
    function SimpleLightmapFilter(lightmapTexture, ambientColor, resolution) {
        if ( resolution === void 0 ) resolution = [1, 1];
    
        superclass.call(this, vertex, fragment);
        this.uniforms.u_lightmap = lightmapTexture;
        this.uniforms.resolution = new Float32Array(resolution);
        this.uniforms.ambientColor =  new Float32Array(ambientColor);
    }

    if ( superclass ) SimpleLightmapFilter.__proto__ = superclass;
    SimpleLightmapFilter.prototype = Object.create( superclass && superclass.prototype );
    SimpleLightmapFilter.prototype.constructor = SimpleLightmapFilter;

    var prototypeAccessors = { texture: {},color: {},resolution: {} };


    /**
     * a texture where your lightmap is rendered
     * @member {PIXI.Texture}
     */
    prototypeAccessors.texture.get = function () {
        return this.uniforms.u_lightmap;
    };
    prototypeAccessors.texture.set = function (value) {
        this.uniforms.u_lightmap = value;
    };

    /**
     * An RGBA array of the ambient color
     * @member {Array<number>}
     */
    prototypeAccessors.color.get = function () {
        return this.uniforms.ambientColor;
    };
    prototypeAccessors.color.set = function (value) {
        this.uniforms.ambientColor = new Float32Array(value);
    };

    /**
     * An array for X/Y resolution
     * @member {Array<number>}
     */
    prototypeAccessors.resolution.get = function () {
        return this.uniforms.resolution;
    };
    prototypeAccessors.resolution.set = function (value) {
        this.uniforms.resolution = new Float32Array(value);
    };

    Object.defineProperties( SimpleLightmapFilter.prototype, prototypeAccessors );

    return SimpleLightmapFilter;
}(PIXI.Filter));

exports.SimpleLightmapFilter = SimpleLightmapFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=simplelightmap.js.map
