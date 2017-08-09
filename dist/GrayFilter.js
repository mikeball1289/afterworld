PIXI.GrayFilter = function()
{
    this.uniforms = {
        gray: 1,
    };
 
    let src = [
        'precision mediump float;',
        'varying vec2 vTextureCoord;',
        'varying vec4 vColor;',
        'uniform sampler2D uSampler;',
        'uniform float gray;',
        
        'void main(void) {',
        '   gl_FragColor = texture2D(uSampler, vTextureCoord);',
        '   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);',
        '}'
    ].join("");
 
    PIXI.Filter.call(this, null, src);
};

PIXI.GrayFilter.prototype = Object.create( PIXI.Filter.prototype );
PIXI.GrayFilter.prototype.constructor = PIXI.GrayFilter;

Object.defineProperty(PIXI.GrayFilter.prototype, 'gray', {
    get: function() {
        return this.uniforms.gray;
    },
    set: function(value) {
        this.uniforms.gray = value;
    }
});
