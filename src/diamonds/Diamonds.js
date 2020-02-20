import {
  WebGLRenderTarget, Object3D,
  Color
} from "three"
import React, { useRef, useMemo } from "react"
import { useLoader, useThree, useFrame } from "react-three-fiber"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import lerp from "lerp"
import BackfaceMaterial from "./BackfaceMaterial"
import RefractionMaterial from "./RefractionMaterial"
import { useBlock } from "../blocks"
import state from "../store"

const child_idx = 6;
const dummy = new Object3D()
export default function Diamonds() {
  const gltf = useLoader(GLTFLoader,
    "/piggy_bank/scene.gltf")
    // "/simple_japanese_tree/scene.gltf")
    // "/diamond.glb")
  useMemo(function () {
    // console.log("xxx", gltf)
    // gltf.__$[child_idx].geometry.center()
    // gltf.scene.children[child_idx].geometry.center()


    gltf.scene.traverse( function ( child ) {
  //     // console.log(child)
      if ( child.geometry ) {
        // console.log('111')
  //       // roughnessMipmapper.generateMipmaps( child.material );
        child.geometry.center()

      }

    } );

  }, [])

  const { size, gl, scene, camera, clock } = useThree()
  const { contentMaxWidth, sectionHeight, mobile } = useBlock()
  const model = useRef()
  const ratio = gl.getPixelRatio()

  const [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial] = useMemo(() => {
    const envFbo = new WebGLRenderTarget(size.width * ratio, size.height * ratio)
    const backfaceFbo = new WebGLRenderTarget(size.width * ratio, size.height * ratio)
    const backfaceMaterial = new BackfaceMaterial()
    const refractionMaterial = new RefractionMaterial({
      envMap: envFbo.texture,
      backfaceMap: backfaceFbo.texture,
      resolution: [size.width * ratio, size.height * ratio]
    })
    return [envFbo, backfaceFbo, backfaceMaterial, refractionMaterial]
  }, [size, ratio])

  useFrame(() => {

    scene.background = new Color( "#fae0e1" );

    // gl.clearColor(1, 0.5, 0.5, 3);
    _iterate_diamonds()




    gl.autoClear = false
    camera.layers.set(0)
    gl.setRenderTarget(envFbo)
    gl.clearColor()
    gl.render(scene, camera)


    gl.clearDepth()

    camera.layers.set(1)
    model.current.material = backfaceMaterial
    gl.setRenderTarget(backfaceFbo)
    gl.clearDepth()
    gl.render(scene, camera)


    camera.layers.set(0)
    gl.setRenderTarget(null)
    gl.render(scene, camera)
    gl.clearDepth()

    scene.background = null

    camera.layers.set(1)
    model.current.material = refractionMaterial
    gl.render(scene, camera)

  }, 1)



function _iterate_diamonds() {
  const t = clock.getElapsedTime() / 2
  let i = 0
  const len = state.diamonds.length;
  while (i < len) {
    const data = state.diamonds[i]
    const { x, offset, scale, factor } = data
    const s = (contentMaxWidth / 35) * scale * 8
    data.pos.set(
      mobile ? 0 : x,
      lerp(data.pos.y, -sectionHeight * offset * factor + (state.top.current / state.zoom) * factor, 0.1),
      0
    )
    dummy.position.copy(data.pos);

    const not_last = (i === len - 1) ^ 1
    const rx = t * not_last;
    const ry = t;
    dummy.rotation.set(rx, ry, rx)

    dummy.scale.set(s, s, s)
    dummy.updateMatrix()
    model.current.setMatrixAt(i, dummy.matrix)
    model.current.instanceMatrix.needsUpdate = true

    ++i;
  }
}
  console.log(gltf)
  return (
    <instancedMesh ref={model} layers={1} args={[null, null, state.diamonds.length]} position={[0, 0, 50]} >
      <bufferGeometry attach="geometry" {...gltf.__$[child_idx].geometry} />
    </instancedMesh>
  )
}
