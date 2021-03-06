import "./custom-material.mjs"
import { useBlock } from "../blocks.mjs"
import state from "../store.mjs"

const { forwardRef, useRef } = global.React;
const { useFrame } = global.ReactTHREE;
const lerp = global.lerp

const Plane = forwardRef(({ color = "white", shift = 1, opacity = 1, args, map, ...props }, ref) => {
    const { viewportHeight, offsetFactor } = useBlock()
    const material = useRef()
    let last = state.top.current
    useFrame(() => {
        const { pages, top } = state
        material.current.scale = lerp(material.current.scale, offsetFactor - top.current / ((pages - 1) * viewportHeight), 0.1)
        material.current.shift = lerp(material.current.shift, (top.current - last) / shift, 0.1)
        last = top.current
    })
    return (
        el("mesh", Object.assign({ ref }, props),
            el("planeBufferGeometry", { attach: "geometry", args }, null),
            el("customMaterial", {
                ref: material,
                attach: "material",
                color: color,
                map: map,
                transparent: true,
                opacity: opacity
            })
        )
    );
})

export default Plane
