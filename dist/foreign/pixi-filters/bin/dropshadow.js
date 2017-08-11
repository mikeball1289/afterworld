/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:00 UTC
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

var fragment = "varying vec2 vTextureCoord;\r\nuniform sampler2D uSampler;\r\nuniform float alpha;\r\nuniform vec3 color;\r\nvoid main(void){\r\n    vec4 sample = texture2D(uSampler, vTextureCoord);\r\n    gl_FragColor = vec4(color, sample.a > 0.0 ? alpha : 0.0);\r\n}";

/**
 * Drop shadow filter.
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [rotation=45] The angle of the shadow in degrees.
 * @param {number} [distance=5] Distance of shadow
 * @param {number} [blur=2] Blur of the shadow
 * @param {number} [color=0x000000] Color of the shadow
 * @param {number} [alpha=0.5] Alpha of the shadow
 */
var DropShadowFilter = (function (superclass) {
    function DropShadowFilter(rotation, distance, blur, color, alpha) {
        if ( rotation === void 0 ) rotation = 45;
        if ( distance === void 0 ) distance = 5;
        if ( blur === void 0 ) blur = 2;
        if ( color === void 0 ) color = 0x000000;
        if ( alpha === void 0 ) alpha = 0.5;

        superclass.call(this);

        this.tintFilter = new PIXI.Filter(vertex, fragment);
        this.blurFilter = new PIXI.filters.BlurFilter();
        this.blurFilter.blur = blur;

        this.rotation = rotation;
        this.padding = distance;
        this.distance = distance;
        this.alpha = alpha;
        this.color = color;
    }

    if ( superclass ) DropShadowFilter.__proto__ = superclass;
    DropShadowFilter.prototype = Object.create( superclass && superclass.prototype );
    DropShadowFilter.prototype.constructor = DropShadowFilter;

    var prototypeAccessors = { distance: {},rotation: {},blur: {},alpha: {},color: {} };

    DropShadowFilter.prototype.apply = function apply (filterManager, input, output) {
        var target = filterManager.getRenderTarget();
        target.clear();
        if (!output.root) {
            output.clear();
        }
        target.transform = new PIXI.Matrix();
        target.transform.translate(
            this.distance * Math.cos(this.angle), 
            this.distance * Math.sin(this.angle)
        );
        this.tintFilter.apply(filterManager, input, target);
        this.blurFilter.apply(filterManager, target, output);
        superclass.prototype.apply.call(this, filterManager, input, output);
        target.transform = null;
        filterManager.returnRenderTarget(target);
    };

    DropShadowFilter.prototype.updatePadding = function updatePadding () {
        this.padding = Math.max(this.distance, 10) * this.blur * 2;
    };

    /**
     * Distance offset of the shadow
     * @member {number}
     * @default 5
     */
    prototypeAccessors.distance.get = function () {
        return this._distance;
    };
    prototypeAccessors.distance.set = function (value) {
        this._distance = value;
        this.updatePadding();
    };

    /**
     * The angle of the shadow in degrees
     * @member {number}
     * @default 2
     */
    prototypeAccessors.rotation.get = function () {
        return this.angle / PIXI.DEG_TO_RAD;
    };
    prototypeAccessors.rotation.set = function (value) {
        this.angle = value * PIXI.DEG_TO_RAD;
    };

    /**
     * The blur of the shadow
     * @member {number}
     * @default 2
     */
    prototypeAccessors.blur.get = function () {
        return this.blurFilter.blur;
    };
    prototypeAccessors.blur.set = function (value) {
        this.blurFilter.blur = value;
        this.updatePadding();
    };

    /**
     * The alpha of the shadow
     * @member {number}
     * @default 1
     */
    prototypeAccessors.alpha.get = function () {
        return this.tintFilter.uniforms.alpha;
    };
    prototypeAccessors.alpha.set = function (value) {
        this.tintFilter.uniforms.alpha = value;
    };

    /**
     * The color of the shadow.
     * @member {number}
     * @default 0x000000
     */
    prototypeAccessors.color.get = function () {
        return PIXI.utils.rgb2hex(this.tintFilter.uniforms.color);
    };
    prototypeAccessors.color.set = function (value) {
        PIXI.utils.hex2rgb(value, this.tintFilter.uniforms.color);
    };

    Object.defineProperties( DropShadowFilter.prototype, prototypeAccessors );

    return DropShadowFilter;
}(PIXI.Filter));

exports.DropShadowFilter = DropShadowFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=dropshadow.js.map
