
import state from "../store.mjs"

const usePromise = require("react-promise-suspense");

const { FontLoader, Vector3, TextBufferGeometry } = global.THREE;
const { useCallback, useRef } = global.React;
const { useLoader, useFrame } = global.ReactTHREE;
const lerp = global.lerp;

function Text({ children, size = 1, left, right, top, bottom, color = "white", opacity = 1, height = 0.01, layers = 0,
    font = "./public/MOONGET_Heavy.blob", ...props }) {
    const data = useLoader(FontLoader, font)
    const geom = usePromise(() => new Promise(res => res(new TextBufferGeometry(children, { font: data, size: 1, height, curveSegments: 32 }))), [children])
    const onUpdate = useCallback(
        self => {
            const box = new Vector3()
            self.geometry.computeBoundingBox()
            self.geometry.boundingBox.getSize(box)
            self.position.x = left ? 0 : right ? -box.x : -box.x / 2
            self.position.y = top ? 0 : bottom ? -box.y : -box.y / 2
        },
        [left, right, top, bottom]
    )

    const ref = useRef()
    let last = state.top.current
    useFrame(() => {
        ref.current.shift = lerp(ref.current.shift, (state.top.current - last) / 100, 0.1)
        last = state.top.current
    })

    return (
        el("group", Object.assign({}, props, {scale: [size, size, 0.1]}),
            el("mesh", {
                    geometry: geom,
                    onUpdate: onUpdate,
                    frustumCulled: false
                },
                el("customMaterial", {
                    ref: ref,
                    attach: "material",
                    color: color,
                    transparent: true,
                    opacity: opacity
                })
            )
        )
    )
}

const MultilineText = ({ text, size = 1, lineHeight = 1, position = [0, 0, 0], ...props }) =>
    text.split("\n").map((text, index) =>
        el(Text, Object.assign({key:index, size:size}, props, {
            position:[position[0], position[1] - index * lineHeight, position[2]],
            children:text
        }))
    )

export { Text, MultilineText }
