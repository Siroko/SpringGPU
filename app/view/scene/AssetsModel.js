/**
 * Created by siroko on 7/19/16.
 */
var AssetsModel = {
    assets3D : {
        models: {
            pathModels : 'assets/obj/',
            pathTextures : 'assets/textures/',
            meshes: [
                {
                    id: 'room',
                    geometry: 'enviro.obj',
                    texture: 'baked_ao.png'
                }
            ]
        }
    }
};

module.exports = AssetsModel;