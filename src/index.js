import ReactDOM from "react-dom"
import React, { Suspense, useEffect, useRef, useMemo } from "react"
import { Canvas, Dom, useLoader, useFrame } from "react-three-fiber"
import { TextureLoader, LinearFilter } from "three"
import lerp from "lerp"
import { Text, MultilineText } from "./components/Text"
import Diamonds from "./diamonds/Diamonds"
import Plane from "./components/Plane"
import { Block, useBlock } from "./blocks"
import state from "./store"
import "./styles.css"


function Startup() {
  const ref = useRef()
  useFrame(function () {
    ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.025)
  })
  return <Plane ref={ref} color="#0e0e0f" position={[0, 0, 200]} scale={[100, 100, 1]} />
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
    <Block factor={factor} offset={offset}>
      <group position={[left ? -alignRight : alignRight, 0, 0]}>
        <Plane map={image} args={[1, 1, 32, 32]} shift={75} size={size} aspect={aspect} scale={[w_size, w_size / aspect, 1]} frustumCulled={false} />
        <Dom
          style={{ width: pixelWidth / (mobile ? 1 : 2), textAlign: left ? "left" : "right" }}
          position={[left || mobile ? -w_size_2 : 0, -w_size_2 / aspect - 0.4, 1]}>
          <div tabIndex={index}>{text}</div>
        </Dom>
        <Text left={left} right={!left} size={w * 0.04} color={color} top position={[(left ? -w_size_2 : w_size_2), w_size_2 / aspect + 0.5, -1]}>
          {header}
        </Text>
        <Block factor={0.2}>
          <Text opacity={0.5} size={w * 0.1} color="#1A1E2A" position={[((left ? w : -w) >> 1) * size, w_size / aspect / 1.5, -10]}>
            {"0" + (index + 1)}
          </Text>
        </Block>
      </group>
    </Block>
  )
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
  const textures = useLoader(
    TextureLoader,
    images // state.paragraphs.map(({ image }) => image)
  )

  useMemo(function () {
    const len = textures.length
    let i = 0
    while (i < len)
      textures[i++].minFilter = LinearFilter
  }, [textures])

  const { contentMaxWidth: w, canvasWidth, canvasHeight, mobile } = useBlock()
  return (
    <>
      <Block factor={1} offset={0}>
        <Block factor={1.2}>
          <Text left size={w * 0.08} position={[-w / 3.2, 0.5, -1]} color="#d40749">
            HELLO WORLD
          </Text>
        </Block>
        <Block factor={1.0}>
          <Dom position={[-w / 3.2, -w * 0.08 + 0.25, -1]}>It was the year 2076.{mobile ? <br /> : " "}The substance had arrived.</Dom>
        </Block>
      </Block>
      <Block factor={1.2} offset={5.7}>
        <MultilineText top left size={w * 0.15} lineHeight={w / 5} position={[-w / 3.5, 0, -1]} color="#2fe8c3" text={"four\nzero\nzero"} />
      </Block>
      {state.paragraphs.map((props, index) => (
        <Paragraph key={index} index={index} {...props} image={textures[index]} />
      ))}
      {state.stripes.map(({ offset, color, height }, index) => (
        <Block key={index} factor={-1.5} offset={offset}>
          <Plane args={[50, height, 32, 32]} shift={-4} color={color} rotation={[0, 0, Math.PI / 8]} position={[0, 0, -10]} />
        </Block>
      ))}
      <Block factor={1.25} offset={8}>
        <Dom className="bottom-left" position={[-canvasWidth / 2, -canvasHeight / 2, 0]}>
          Culture is not your friend.
        </Dom>
      </Block>
    </>
  )
}

const camera = { zoom: state.zoom, position: [0, 0, 500] }

function App() {  
  const scrollArea = useRef()
  const onScroll = function (e) {
    const target = e.target
    requestAnimationFrame(function(){
      state.top.current = target.scrollTop;
    });
  }
  useEffect(() => void onScroll({ target: scrollArea.current }), [])
  return (
    <>
      <Canvas className="canvas" concurrent  pixelRatio={1} orthographic camera={camera}>
        <Suspense
          fallback={<Dom center className="loading" children="Loading..." />}
        >
          <Diamonds />
          <Content />
          <Startup />
        </Suspense>
      </Canvas>
      <div className="scrollArea" ref={scrollArea} onScroll={onScroll}>
        {new Array(state.sections).fill().map((_, index) => (
          <div key={index} id={"0" + index} style={{ height: `${(state.pages / state.sections) * 100}vh` }} />
        ))}
      </div>

    </>
  )
}

// ReactDOM.render(<App />, document.getElementById("root"))
ReactDOM.createRoot(document.getElementById("root")).render(<App />)

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