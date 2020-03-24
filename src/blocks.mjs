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

const BLOCK_CTX = {
    offset: 0.0,
    viewportWidth: 0|0,
    viewportHeight: 0|0,
    canvasWidth: 0.0,
    canvasHeight: 0.0,
    margin: 0.0,
    contentMaxWidth: 0.0,
    sectionHeight: 0.0,
    offsetFactor: 0.0,
    mobile: false,
}

function useBlock() {
    const { sections, pages, zoom } = state
    const { size, viewport } = useThree()
    const viewportWidth = viewport.width
    const viewportHeight = viewport.height
    const canvasWidth = viewportWidth / zoom
    const canvasHeight = viewportHeight / zoom
    const mobile = size.width < 700
    const margin = canvasWidth * (mobile ? 0.2 : 0.1)
    const contentMaxWidth = canvasWidth * (mobile ? 0.8 : 0.6)
    const sectionHeight = canvasHeight * ((pages - 1) / (sections - 1))

    const offset = useContext(offsetContext)
    const offsetFactor = (offset + 1.0) / sections

    BLOCK_CTX.offset = offset;
    BLOCK_CTX.viewportWidth = viewportWidth;
    BLOCK_CTX.viewportHeight = viewportHeight;
    BLOCK_CTX.canvasWidth = canvasWidth;
    BLOCK_CTX.canvasHeight = canvasHeight;
    BLOCK_CTX.mobile = mobile;
    BLOCK_CTX.margin = margin;
    BLOCK_CTX.contentMaxWidth = contentMaxWidth;
    BLOCK_CTX.sectionHeight = sectionHeight;
    BLOCK_CTX.offsetFactor = offsetFactor;

    return BLOCK_CTX;
}

export { Block, useBlock }
