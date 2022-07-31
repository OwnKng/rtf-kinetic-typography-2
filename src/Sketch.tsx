import { Text } from "@react-three/drei"
import Mirror from "./Mirror"
import { useThree } from "@react-three/fiber"

const Sketch = () => {
  const { viewport } = useThree()

  return (
    <>
      <mesh position={[0, 0, -10]}>
        <planeBufferGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial color='#1e2124' />
      </mesh>
      <Text
        position={[0, 0, 5]}
        fontSize={3}
        maxWidth={viewport.width}
        textAlign='justify'
      >
        OwnKng.
      </Text>
      <Mirror />
    </>
  )
}

export default Sketch
