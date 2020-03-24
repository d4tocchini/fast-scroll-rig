const {
    ReactDOM, React, THREE, ReactTHREE, lerp, el
} = global;
const {
    Suspense, useEffect, useRef, useMemo
} = React;

const { TextureLoader, LinearFilter } = THREE;
const { Canvas, Dom, useLoader, useFrame } = ReactTHREE;

import Plane from "./components/plane.mjs"
import { Text, MultilineText } from "./components/text.mjs"
// import Diamonds from "./diamonds/Diamonds.mjs"
import { Block, useBlock } from "./blocks.mjs"
import state from "./store.mjs"
// import "./styles.css"


function App() {
    const ref = useRef();

    return els(
        el_canvas(
            el_load([
                // el(Diamonds, null),
                el(Content, null),
                el(Startup, null)
            ])
        ),
        el_scroll_target(ref)
    );
}


function Startup() {
    const ref = useRef()
    useFrame(on_frame)

    return (Startup = function() {
        return el(Plane, { ref, color: "#0e0e0f", position: [0, 0, 200], scale: [100, 100, 1] },
        null)
    })()

    function on_frame () {
        const opacity = lerp(ref.current.material.opacity, 0, 0.025)
        ref.current.material.opacity = opacity
        // if (opacity < .01)
        //     finished()
    }
    // function finished() {
    //     console.log('on_frame')
    //     Startup = RETURN_NULL;
    //     // on_frame = NOOP;
    // }
}

function extract_images(list) {
    const images = []
    const len = list.length
    let i = 0
    while (i < len) {
        images.push(list[i++].image)
    }
    return images;
}

function Content() {
    const images = extract_images(state.paragraphs)
    const textures = useLoader(TextureLoader, images);

    useMemo(function () {
        const len = textures.length
        let i = 0
        while (i < len)
            textures[i++].minFilter = LinearFilter
    }, [textures])

    const { contentMaxWidth: w, canvasWidth, canvasHeight, mobile } = useBlock()
    return els(
        el(Block, {factor: 1, offset: 0},
            el(Block, {factor: 1.2},
                el(Text, {left: true, size: w * 0.08, color: "#d40749", position: [-w / 3.2, 0.5, -1]},
                    "HELLO WORLD")
            ),
            el(Block, {factor: 1.0},
                el(Dom,{position: [-w / 3.2, -w * 0.08 + 0.25, -1]},
                    "It was the year 2076.",
                    mobile ? el("br", null) : " ",
                    "The substance had arrived."
                )
            )
        ),
        el(Block,{factor: 1.2, offset: 5.7},
            el(MultilineText, {
                top: true,
                left: true,
                size: w * 0.15,
                lineHeight: w / 5,
                position: [-w / 3.5, 0, -1],
                color: "#2fe8c3",
                text: "four\nzero\nzero"
            })
        ),
        state.paragraphs.map((props, index) =>
            el(Paragraph, Object.assign({},props,
                {
                    key: index,
                    index: index,
                    image: textures[index]
                })
            )
        ),
        state.stripes.map(({ offset, color, height }, index) =>
            el(Block, {key: index, factor: -1.5, offset: offset},
                el(Plane, {
                    args: [50, height, 32, 32],
                    shift: -4,
                    color: color,
                    rotation: [0, 0, Math.PI / 8],
                    position: [0, 0, -10]
                }))
        ),
        el(Block, {factor: 1.25, offset: 8},
            el(Dom, {className: "bottom-left", position:[-canvasWidth/2, -canvasHeight/2, 0] },
                "Culture is not your friend."))
    );
}


function Paragraph({ image, index, offset, factor, header, aspect, text }) {
    const { contentMaxWidth: w, canvasWidth, margin, mobile } = useBlock()
    const size = aspect < 1 && !mobile ? 0.65 : 1
    const alignRight = (canvasWidth - w * size - margin) >> 1
    const pixelWidth = w * state.zoom * size
    const is_right = index & 1; //(index % 2)
    const left = is_right ^ 1; // !(index % 2)
    const color = is_right ? "#D40749" : "#2FE8C3"
    const w_size = w * size;
    const w_size_2 = (w_size) >> 1; // (w * size) / 2

    return (
        el(Block, { factor, offset },
            el("group", { position: [left ? -alignRight : alignRight, 0, 0] },
                el(Plane, {
                    map: image,
                    args: [1, 1, 32, 32],
                    shift: 75,
                    size,
                    aspect,
                    scale: [w_size, w_size / aspect, 1],
                    frustumCulled: false
                }),
                el(Dom, {
                    style: {
                        width: pixelWidth / (mobile ? 1 : 2),
                        textAlign: left ? "left" : "right"
                    },
                    position: [
                        (left || mobile) ? -w_size_2 : 0,
                        -w_size_2 / aspect - 0.4,
                        1
                    ]
                },
                    el("div", { tabIndex: index },
                        text)
                ),
                el(Text, {
                    color, left, right: !left, size: w * 0.04, top: true,
                    position: [left ? -w_size_2 : w_size_2, w_size_2 / aspect + 0.5, -1]
                },
                    header),
                el(Block, { factor: 0.2 },
                    el(Text, {
                        opacity: 0.5,
                        size: w * 0.1,
                        color: "#1A1E2A",
                        position: [
                            ((left ? w : -w) >> 1) * size,
                            w_size / aspect / 1.5,
                            -10
                        ]
                    },
                        "0" + (index + 1)
                    )
                )
            )
        )
    );
}




const camera = {
    zoom: state.zoom,
    position: [0, 0, 500]
}
const canvas_attrs = {
    className: "canvas",
    concurrent: true,
    pixelRatio: 1,
    orthographic: true,
    camera: camera
}

function el_canvas(child) {
    return el(Canvas, canvas_attrs, child)
}

function el_load(children) {
    return el(Suspense, {fallback:el_loading()}, ...children);
}

function el_loading() {
    return el(Dom, {center: true, className: "loading", children: "Loading..."});
}

function el_scroll_target(ref) {
    let scroll_target;
    useMount(function ( ) {
        _will_scroll(ref.current)}
    )
    function onScroll (e) {_will_scroll(e.target)}

    function _will_scroll(target) {
        scroll_target = target;;
        requestAnimationFrame(_did_scroll);
    }

    function _did_scroll() {
        state.top.current = scroll_target.scrollTop;
    }

    return (
        el("div", {className: "scrollArea", ref, onScroll},
            _el_scroll_body(state.pages, state.sections)
        )
    );
}

function _el_scroll_body(page_count, section_count) {
    const sections = [];
    const section_height = `${(page_count / section_count) * 100}vh`;
    const style = {height:section_height}
    let i = 0;
    while (i < section_count) {
        const key = i++;
        sections.push(
            el("div", {key, id:`0${key}`, style})
        )
    }
    return sections;
}

// ReactDOM.render(<App />, document.getElementById("root"))
ReactDOM.createRoot(document.getElementById("root")).render(el(App,null))

/*

<div className="frame">
<h1 className="frame__title">Scroll, Refraction and Shader Effects</h1>
<div className="frame__links">
  <a className="frame__link" href="http://tympanus.net/Tutorials/PhysicsMenu/">
    Previous demo
  </a>
  <a className="frame__link" href="https://tympanus.net/codrops/?p=45441">
    Article
  </a>
  <a className="frame__link" href="https://github.com/drcmda/the-substance">
    GitHub
  </a>
</div>
<div className="frame__nav">
  <a className="frame__link" href="#00" children="intro" />
  <a className="frame__link" href="#01" children="01" />
  <a className="frame__link" href="#02" children="02" />
  <a className="frame__link" href="#03" children="03" />
  <a className="frame__link" href="#04" children="04" />
  <a className="frame__link" href="#05" children="05" />
  <a className="frame__link" href="#07" children="06" />
</div>
</div>

*/