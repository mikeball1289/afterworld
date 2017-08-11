/*!
 * pixi-filters - v1.0.8
 * Compiled Mon, 24 Jul 2017 17:05:14 UTC
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

var fragment = "varying vec2 vTextureCoord;\r\n\r\nuniform sampler2D uSampler;\r\nuniform float blur;\r\nuniform float gradientBlur;\r\nuniform vec2 start;\r\nuniform vec2 end;\r\nuniform vec2 delta;\r\nuniform vec2 texSize;\r\n\r\nfloat random(vec3 scale, float seed)\r\n{\r\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\r\n}\r\n\r\nvoid main(void)\r\n{\r\n    vec4 color = vec4(0.0);\r\n    float total = 0.0;\r\n\r\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\r\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\r\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\r\n\r\n    for (float t = -30.0; t <= 30.0; t++)\r\n    {\r\n        float percent = (t + offset - 0.5) / 30.0;\r\n        float weight = 1.0 - abs(percent);\r\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\r\n        sample.rgb *= sample.a;\r\n        color += sample * weight;\r\n        total += weight;\r\n    }\r\n\r\n    gl_FragColor = color / total;\r\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\r\n}\r\n";

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftAxisFilter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @private
 */
var TiltShiftAxisFilter = (function (superclass) {
    function TiltShiftAxisFilter(blur, gradientBlur, start, end){
        if ( blur === void 0 ) blur = 100;
        if ( gradientBlur === void 0 ) gradientBlur = 600;
        if ( start === void 0 ) start = null;
        if ( end === void 0 ) end = null;

        superclass.call(this, vertex, fragment);
        this.uniforms.blur = blur;
        this.uniforms.gradientBlur = gradientBlur;
        this.uniforms.start = start || new PIXI.Point(0, window.innerHeight / 2);
        this.uniforms.end = end || new PIXI.Point(600, window.innerHeight / 2);
        this.uniforms.delta = new PIXI.Point(30, 30);
        this.uniforms.texSize = new PIXI.Point(window.innerWidth, window.innerHeight);
        this.updateDelta();
    }

    if ( superclass ) TiltShiftAxisFilter.__proto__ = superclass;
    TiltShiftAxisFilter.prototype = Object.create( superclass && superclass.prototype );
    TiltShiftAxisFilter.prototype.constructor = TiltShiftAxisFilter;

    var prototypeAccessors = { blur: {},gradientBlur: {},start: {},end: {} };

    /**
     * Updates the filter delta values.
     * This is overridden in the X and Y filters, does nothing for this class.
     *
     */
    TiltShiftAxisFilter.prototype.updateDelta = function updateDelta () {
        this.uniforms.delta.x = 0;
        this.uniforms.delta.y = 0;
    };

    /**
     * The strength of the blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    prototypeAccessors.blur.get = function () {
        return this.uniforms.blur;
    };
    prototypeAccessors.blur.set = function (value) {
        this.uniforms.blur = value;
    };

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    prototypeAccessors.gradientBlur.get = function () {
        return this.uniforms.gradientBlur;
    };
    prototypeAccessors.gradientBlur.set = function (value) {
        this.uniforms.gradientBlur = value;
    };

    /**
     * The X value to start the effect at.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    prototypeAccessors.start.get = function () {
        return this.uniforms.start;
    };
    prototypeAccessors.start.set = function (value) {
        this.uniforms.start = value;
        this.updateDelta();
    };

    /**
     * The X value to end the effect at.
     *
     * @member {PIXI.Point}
     * @memberof PIXI.filters.TiltShiftAxisFilter#
     */
    prototypeAccessors.end.get = function () {
        return this.uniforms.end;
    };
    prototypeAccessors.end.set = function (value) {
        this.uniforms.end = value;
        this.updateDelta();
    };

    Object.defineProperties( TiltShiftAxisFilter.prototype, prototypeAccessors );

    return TiltShiftAxisFilter;
}(PIXI.Filter));

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftXFilter.
 *
 * @class
 * @extends PIXI.TiltShiftAxisFilter
 * @memberof PIXI.filters
 * @private
 */
var TiltShiftXFilter = (function (TiltShiftAxisFilter$$1) {
    function TiltShiftXFilter () {
        TiltShiftAxisFilter$$1.apply(this, arguments);
    }

    if ( TiltShiftAxisFilter$$1 ) TiltShiftXFilter.__proto__ = TiltShiftAxisFilter$$1;
    TiltShiftXFilter.prototype = Object.create( TiltShiftAxisFilter$$1 && TiltShiftAxisFilter$$1.prototype );
    TiltShiftXFilter.prototype.constructor = TiltShiftXFilter;

    TiltShiftXFilter.prototype.updateDelta = function updateDelta () {
        var dx = this.uniforms.end.x - this.uniforms.start.x;
        var dy = this.uniforms.end.y - this.uniforms.start.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        this.uniforms.delta.x = dx / d;
        this.uniforms.delta.y = dy / d;
    };

    return TiltShiftXFilter;
}(TiltShiftAxisFilter));

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShiftYFilter.
 *
 * @class
 * @extends PIXI.TiltShiftAxisFilter
 * @memberof PIXI.filters
 * @private
 */
var TiltShiftYFilter = (function (TiltShiftAxisFilter$$1) {
    function TiltShiftYFilter () {
        TiltShiftAxisFilter$$1.apply(this, arguments);
    }

    if ( TiltShiftAxisFilter$$1 ) TiltShiftYFilter.__proto__ = TiltShiftAxisFilter$$1;
    TiltShiftYFilter.prototype = Object.create( TiltShiftAxisFilter$$1 && TiltShiftAxisFilter$$1.prototype );
    TiltShiftYFilter.prototype.constructor = TiltShiftYFilter;

    TiltShiftYFilter.prototype.updateDelta = function updateDelta () {
        var dx = this.uniforms.end.x - this.uniforms.start.x;
        var dy = this.uniforms.end.y - this.uniforms.start.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        this.uniforms.delta.x = -dy / d;
        this.uniforms.delta.y = dx / d;
    };

    return TiltShiftYFilter;
}(TiltShiftAxisFilter));

/**
 * @author Vico @vicocotea
 * original filter https://github.com/evanw/glfx.js/blob/master/src/filters/blur/tiltshift.js by Evan Wallace : http://madebyevan.com/
 */

/**
 * A TiltShift Filter. Manages the pass of both a TiltShiftXFilter and TiltShiftYFilter.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {number} [blur=100] The strength of the blur.
 * @param {number} [gradientBlur=600] The strength of the gradient blur.
 * @param {PIXI.Point} [start=null] The Y value to start the effect at.
 * @param {PIXI.Point} [end=null] The Y value to end the effect at.
 */
var TiltShiftFilter = (function (superclass) {
    function TiltShiftFilter(blur, gradientBlur, start, end) {
        if ( blur === void 0 ) blur = 100;
        if ( gradientBlur === void 0 ) gradientBlur = 600;
        if ( start === void 0 ) start = null;
        if ( end === void 0 ) end = null;

        superclass.call(this);
        this.tiltShiftXFilter = new TiltShiftXFilter(blur, gradientBlur, start, end);
        this.tiltShiftYFilter = new TiltShiftYFilter(blur, gradientBlur, start, end);
    }

    if ( superclass ) TiltShiftFilter.__proto__ = superclass;
    TiltShiftFilter.prototype = Object.create( superclass && superclass.prototype );
    TiltShiftFilter.prototype.constructor = TiltShiftFilter;

    var prototypeAccessors = { blur: {},gradientBlur: {},start: {},end: {} };

    TiltShiftFilter.prototype.apply = function apply (filterManager, input, output) {
        var renderTarget = filterManager.getRenderTarget(true);
        this.tiltShiftXFilter.apply(filterManager, input, renderTarget);
        this.tiltShiftYFilter.apply(filterManager, renderTarget, output);
        filterManager.returnRenderTarget(renderTarget);
    };

    /**
     * The strength of the blur.
     *
     * @member {number}
     */
    prototypeAccessors.blur.get = function () {
        return this.tiltShiftXFilter.blur;
    };
    prototypeAccessors.blur.set = function (value) {
        this.tiltShiftXFilter.blur = this.tiltShiftYFilter.blur = value;
    };

    /**
     * The strength of the gradient blur.
     *
     * @member {number}
     */
    prototypeAccessors.gradientBlur.get = function () {
        return this.tiltShiftXFilter.gradientBlur;
    };
    prototypeAccessors.gradientBlur.set = function (value) {
        this.tiltShiftXFilter.gradientBlur = this.tiltShiftYFilter.gradientBlur = value;
    };

    /**
     * The Y value to start the effect at.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.start.get = function () {
        return this.tiltShiftXFilter.start;
    };
    prototypeAccessors.start.set = function (value) {
        this.tiltShiftXFilter.start = this.tiltShiftYFilter.start = value;
    };

    /**
     * The Y value to end the effect at.
     *
     * @member {PIXI.Point}
     */
    prototypeAccessors.end.get = function () {
        return this.tiltShiftXFilter.end;
    };
    prototypeAccessors.end.set = function (value) {
        this.tiltShiftXFilter.end = this.tiltShiftYFilter.end = value;
    };

    Object.defineProperties( TiltShiftFilter.prototype, prototypeAccessors );

    return TiltShiftFilter;
}(PIXI.Filter));

exports.TiltShiftFilter = TiltShiftFilter;
exports.TiltShiftXFilter = TiltShiftXFilter;
exports.TiltShiftYFilter = TiltShiftYFilter;
exports.TiltShiftAxisFilter = TiltShiftAxisFilter;

Object.defineProperty(exports, '__esModule', { value: true });

Object.assign(PIXI.filters, __pixiFilters);

})));
//# sourceMappingURL=tiltshift.js.map
