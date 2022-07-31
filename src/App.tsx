import "./App.css"
import Sketch from "./Sketch"
import { Canvas, useFrame } from "@react-three/fiber"
import { Vector3 } from "three"

const RigControls = () =>
  useFrame(({ camera, mouse }) => {
    camera.position.lerp(new Vector3(mouse.x * 5, mouse.y * 5, 100), 0.05)
    camera.lookAt(0, 0, 0)
  })

const App = () => (
  <Canvas orthographic camera={{ zoom: 100, position: [0, 0, 100] }}>
    <RigControls />
    <Sketch />
  </Canvas>
)

export default App
