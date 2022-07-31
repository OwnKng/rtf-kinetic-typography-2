import { useMemo, useRef } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"

const width = 12

const vertexShader = /* glsl */ `
    uniform float uTime; 

    varying vec3 worldNormal; 
    varying vec3 viewDirection; 

    void main() {
        vec4 transformedNormal = vec4(normal, 0.0); 
        vec4 modelPosition = vec4(position, 1.0);
        

        worldNormal = normalize(modelMatrix * transformedNormal).xyz; 
        viewDirection = normalize((modelMatrix * modelPosition).xyz - cameraPosition); 

        gl_Position = projectionMatrix * modelViewMatrix * modelPosition; 
    }
`

const fragmentShader = /*glsl*/ `
    uniform sampler2D envMap; 
    uniform sampler2D backfaceMap;
    uniform vec2 resolution; 


    varying vec3 worldNormal;
    varying vec3 viewDirection;

    float calculateFresnel(vec3 viewDirection, vec3 worldNormal) {
        return pow(1.05 + dot( viewDirection, worldNormal), 10.0);
    }

    void main() {
        vec2 _uv = gl_FragCoord.xy / resolution;
        float alpha = 0.4; 
        vec3 normal = worldNormal * (1.0 - alpha);

        _uv += refract(viewDirection, normal, 1.0 / 1.33).xy; 

        float f = calculateFresnel(viewDirection, normal); 

        vec3 refractedColor = vec3(1.0); 

        float r = texture2D(envMap, _uv + vec2(0.02) * f).r; 
        float g = texture2D(envMap, _uv + vec2(0.01) * f).g; 
        float b = texture2D(envMap, _uv).b; 

        vec3 color = vec3(r, g, b); 
        gl_FragColor = vec4(mix(color, refractedColor, f), 1.0);        
    }
`

const Mirrors = () => {
  const { size, gl, scene, camera, viewport } = useThree()

  const data = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        position: [
          (((i * 2) % width) * viewport.width) / width,
          Math.floor((i * 2) / viewport.height),
          Math.random() * 10,
        ],
        scale: 0.5 + Math.random() * 0.5,
        speed: Math.random() * 0.5,
      })),
    [viewport]
  )

  const [envFbo, refractionMaterial] = useMemo(() => {
    const envFbo = new THREE.WebGLRenderTarget(size.width, size.height)

    const refractionMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,

      uniforms: {
        resolution: {
          value: new THREE.Vector2(size.width, size.height),
        },
        envMap: { value: envFbo.texture },
        uTime: { value: 0 },
      },
    })

    return [envFbo, refractionMaterial]
  }, [size.width, size.height])

  useFrame(() => {
    gl.autoClear = false

    gl.setRenderTarget(envFbo)
    gl.clearColor()
    gl.render(scene, camera)
    gl.clearDepth()

    gl.setRenderTarget(null)
    gl.render(scene, camera)

    gl.render(scene, camera)
  })

  return (
    <group position={[-viewport.width / 2 + 1, -3, 0]}>
      {data.map((d, i) => (
        <Mirror
          key={`${i}-mirror`}
          position={d.position}
          scale={d.scale}
          material={refractionMaterial}
          speed={d.speed}
        />
      ))}
    </group>
  )
}

const Mirror = ({ position, scale, speed, material }: any) => {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    ref.current.rotation.x += 0.02 * speed
    ref.current.rotation.y += 0.001 * speed
    ref.current.rotation.z += 0.02 * speed
  })

  return (
    <mesh
      ref={ref}
      position={position}
      scale={[scale, scale, 1]}
      material={material}
      rotation={[
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ]}
    >
      <boxBufferGeometry args={[1, 1, 0.05]} />
    </mesh>
  )
}

export default Mirrors
