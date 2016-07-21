import bpy

# get selected objects
selected = bpy.context.selected_objects

for obj in selected:
    # set as active
    bpy.context.scene.objects.active = obj
    
    # enter edit mode and select all faces
    bpy.ops.object.mode_set(mode='EDIT') 
    bpy.ops.mesh.select_mode(type='FACE')
    bpy.ops.mesh.select_all(action='SELECT')
    
    # extrude depth
    bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={"value":(0, -0.1, 0)})
    
    # select all new faces
    bpy.ops.mesh.select_all(action='SELECT')
    
    # fatten
    bpy.ops.transform.shrink_fatten(value=-1.5, use_even_offset=False, mirror=False, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1)

    # back to normal
    bpy.ops.object.mode_set(mode='OBJECT')

    # smooth
    bpy.ops.object.modifier_add(type='SUBSURF')

    # then apply smooth
    # create folds with sculpt tool
    