/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:04:49 UTC
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

var ref = PIXI.filters;
var BlurXFilter = ref.BlurXFilter;
var BlurYFilter = ref.BlurYFilter;
var VoidFilter = ref.VoidFilter;

/**
 * The BloomFilter applies a Gaussian blur to an object.
 * The strength of the blur can be set for x- and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number|PIXI.Point} [blur=2] Sets the strength of both the blurX and blurY properties simultaneously
 */
var BloomFilter = (function (superclass) {
    function BloomFilter(blur) {
        if ( blur === void 0 ) blur = 2;

        superclass.call(this);
        this.blurXFilter = new BlurXFilter();
        this.blurYFilter = new BlurYFilter();
        this.blurYFilter.blendMode = PIXI.BLEND_MODES.SCREEN;
        this.defaultFilter = new VoidFilter();

        if (typeof blur === 'number') {
            this.blur = blur;
        }
        else if (blur instanceof PIXI.Point) {
            this.blurX = blur.x;
            this.blurY = blur.y;
        }
    }

    if ( superclass ) BloomFilter.__proto__ = superclass;
    BloomFilter.prototype = Object.create( superclass && superclass.prototype );
    BloomFilter.prototype.constructor = BloomFilter;

    var prototypeAccessors = { blur: {},blurX: {},blurY: {} };

    BloomFilter.prototype.apply = function apply (filterManager, input, output) {
        var renderTarget = filterManager.getRenderTarget(true);

        //TODO - copyTexSubImage2D could be used here?
        this.defaultFilter.apply(filterManager, input, output);

        this.blurXFilter.apply(filterManager, input, renderTarget);
        this.blurYFilter.apply(filterManager, renderTarget, output);

        filterManager.returnRenderTarget(renderTarget);
    };

    /**
     * Sets the strength of both the blurX and blurY properties simultaneously
     *
     * @member {number}
     * @default 2
     */
    prototypeAccessors.blur.get = function () {
        return this.blurXFilter.blur;
    };
    prototypeAccessors.blur.set = function (value) {
        this.blurXFilter.blur = this.blurYFilter.blur = value;
    };

    /**
     * Sets the strength of the blurX property
     *
     * @member {number}
     * @default 2
     */
    prototypeAccessors.blurX.get = function () {
        return this.blurXFilter.blur;
    };
    prototypeAccessors.blurX.set = function (value) {
        this.blurXFilter.blur = value;
    };

    /**
     * Sets the strength of the blurY property
     *
     * @member {number}
     * @default 2
     */
    prototypeAccessors.blurY.get = function () {
        return this.blurYFilter.blur;
    };
    prototypeAccessors.blurY.set = function (value) {
        this.blurYFilter.blur = value;
    };

    Object.defineProperties( BloomFilter.prototype, prototypeAccessors );

    return BloomFilter;
}(PIXI.Filter));

exports.BloomFilter = BloomFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=bloom.js.map
