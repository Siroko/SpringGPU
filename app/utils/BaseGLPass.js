/**
 * Created by siroko on 7/13/15.
 */

var THREE = require('three');

var BaseGLPass = function( params ) {

    THREE.EventDispatcher.call( this );

    this.renderer   = params.renderer;

    this.bufferGeometry = null;

    this.sceneRT = new THREE.Scene();
    this.sceneBuffer = new THREE.Scene();

    this.cameraOrto = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );

    this.quad_geom = new THREE.PlaneBufferGeometry( 2, 2, 1, 1 );
    this.quad = new THREE.Mesh( this.quad_geom, null );
    this.sceneRT.add( this.quad );
};

BaseGLPass.prototype = Object.create( THREE.EventDispatcher.prototype );


BaseGLPass.prototype.pass = function( material, target ) {

    this.quad.material = material;
    this.renderer.render( this.sceneRT, this.cameraOrto, target );

};

BaseGLPass.prototype.getRenderTarget = function( w, h ) {

    var renderTarget = new THREE.WebGLRenderTarget( w, h, {
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        stencilBuffer: false,
        depthBuffer: false,
        generateMipmaps: false
    } );

    renderTarget.needsUpdate = true;
    return renderTarget;
};

module.exports = BaseGLPass;