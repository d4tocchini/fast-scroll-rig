const { React, ReactTHREE, el, lerp } = global;
const { createContext, useRef, useContext } = React;
const { useFrame, useThree } = ReactTHREE;
import state from "./store.mjs"

const offsetContext = createContext(0)

function Block({ offset, factor, children }) {
    const ref = useRef()
    useFrame(on_frame)

    const { offset: parentOffset, sectionHeight } = useBlock();
    offset = (offset !== undefined) ? offset : parentOffset;

    return (
        el(offsetContext.Provider, { value: offset },
            el("group", {position: [0, -sectionHeight * offset * factor, 0]},
                el("group", { ref },
                    children)))
    );

    function on_frame() {
        const curY = ref.current.position.y
        const curTop = state.top.current
        ref.current.position.y = lerp(curY, (curTop / state.zoom) * factor, 0.1)
    }
}

function useBlock() {
    const { sections, pages, zoom } = state
    const { size, viewport } = useThree()
    const offset = useContext(offsetContext)
    const viewportWidth = viewport.width
    const viewportHeight = viewport.height
    const canvasWidth = viewportWidth / zoom
    const canvasHeight = viewportHeight / zoom
    const mobile = size.width < 700
    const margin = canvasWidth * (mobile ? 0.2 : 0.1)
    const contentMaxWidth = canvasWidth * (mobile ? 0.8 : 0.6)
    const sectionHeight = canvasHeight * ((pages - 1) / (sections - 1))
    const offsetFactor = (offset + 1.0) / sections
    return {
        viewport,
        offset,
        viewportWidth,
        viewportHeight,
        canvasWidth,
        canvasHeight,
        mobile,
        margin,
        contentMaxWidth,
        sectionHeight,
        offsetFactor
    }
}

export { Block, useBlock }
