EXTRUSION = -0.1
FATTEN = -1.5
SMOOTHNESS = 3
HIDE = True

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
    
    # extrude
    bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={"value":(0, EXTRUSION, 0)})
    
    # select all new faces
    bpy.ops.mesh.select_all(action='SELECT')
    
    # fatten
    bpy.ops.transform.shrink_fatten(value=FATTEN, use_even_offset=False, mirror=False, proportional='DISABLED', proportional_edit_falloff='SMOOTH', proportional_size=1)

    # back to object mode
    bpy.ops.object.mode_set(mode='OBJECT')

    # center origin
    bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')

    # add smoothness
    bpy.ops.object.modifier_add(type='SUBSURF')
    bpy.context.object.modifiers["Subsurf"].levels = SMOOTHNESS

    # apply smoothness
    bpy.ops.object.modifier_apply(modifier='Subsurf')

    # center
    bpy.context.object.location = (0, 0, 0)

    # apply location, scale and rotation
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # hide
    if HIDE:
        bpy.context.object.hide = true