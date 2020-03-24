
import BackfaceMaterial from "./BackfaceMaterial.mjs"
import RefractionMaterial from "./RefractionMaterial.mjs"
import { useBlock } from "../blocks.mjs"
import state from "../store.mjs"

const {
    WebGLRenderTarget, Object3D,
    Color, GLTFLoader
} = global.THREE
const { useRef, useMemo } = global.React;
const { useLoader, useThree, useFrame } = global.ReactTHREE;
const lerp = global.lerp;

const child_idx = 6;
const dummy = new Object3D()
export default function Diamonds() {

    const { size, gl, scene, camera, clock } = useThree()
    const { contentMaxWidth, sectionHeight, mobile } = useBlock()
    const model = useRef()
    const ratio = gl.getPixelRatio()

    const gltf = useLoader(GLTFLoader, "./public/piggy_bank/scene.gltf")
    // "/simple_japanese_tree/scene.gltf")
    // "/diamond.glb")
    useMemo(function () {
        // console.log("xxx", gltf)
        // gltf.__$[child_idx].geometry.center()
        // gltf.scene.children[child_idx].geometry.center()


        gltf.scene.traverse(function (child) {
            //     // console.log(child)
            if (child.geometry) {
                // console.log('111')
                //       // roughnessMipmapper.generateMipmaps( child.material );
                child.geometry.center()

            }

        });

    }, [])

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

    // TODO
    useFrame(function() {

        scene.background = state.colors.bg;

        // gl.clearColor(1, 0.5, 0.5, 3);
        _iterate_diamonds()

        gl.autoClear = false
        camera.layers.set(0)
        gl.setRenderTarget(envFbo)
        // gl.clearColor()          // NOTE: @D4: confirm not needed
        gl.render(scene, camera)
        // gl.clearDepth()          // NOTE: @D4: confirm not needed

        camera.layers.set(1)
        model.current.material = backfaceMaterial
        gl.setRenderTarget(backfaceFbo)
        // gl.clearDepth()          // NOTE: @D4: confirm not needed
        gl.render(scene, camera)    // render backface of models (makes it look transparent)

        camera.layers.set(0)
        gl.setRenderTarget(null)
        gl.render(scene, camera)    // render content layer
        gl.clearDepth()

        scene.background = null
        camera.layers.set(1)
        model.current.material = refractionMaterial
        gl.render(scene, camera)    // render refracted model on content layer

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

    // console.log(gltf)

    return (
        el("instancedMesh", {
                ref: model,
                layers: 1,
                args: [null, null, state.diamonds.length],
                position: [0, 0, 50]
            },
            el("bufferGeometry", Object.assign({attach: "geometry"}, gltf.__$[child_idx].geometry), null)
        )
    )
}
