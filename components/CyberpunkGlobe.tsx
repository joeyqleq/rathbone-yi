"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GlitchTitle } from "./GlitchTitle"
import { ImageModal } from "./ImageModal"

interface FloatingButton {
  id: number
  position: THREE.Vector3
  image: string
  title: string
  mesh?: THREE.Mesh
  originalPosition: THREE.Vector3
}

const images = [
  { src: "/images/palestine-coin.png", title: "The Ancient Prophecy" },
  { src: "/images/political-poster.png", title: "The Revelation" },
  { src: "/images/handwritten-note.png", title: "Sacred Writings" },
  { src: "/images/coins-shekel.png", title: "Divine Currency" },
  { src: "/images/rathbone-portrait.png", title: "The Lord Himself" },
  { src: "/images/middle-east-map.png", title: "The Promised Land" },
]

export function CyberpunkGlobe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const controlsRef = useRef<OrbitControls>()
  const globeRef = useRef<THREE.Mesh>()
  const buttonsRef = useRef<FloatingButton[]>([])
  const phaserBeamsRef = useRef<THREE.Mesh[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isGlitching, setIsGlitching] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const animationIdRef = useRef<number>()

  const createDeathStarGeometry = useCallback(() => {
    const geometry = new THREE.SphereGeometry(5, 64, 64)
    const positions = geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]

      if (x > 2 && Math.sqrt(y * y + z * z) < 2.5) {
        const distanceFromCenter = Math.sqrt(y * y + z * z)
        const indentation = Math.cos((distanceFromCenter * Math.PI) / 5) * 0.8
        positions[i] = x - Math.max(0, indentation)
      }
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [])

  const createGlowingOrb = useCallback((type: "comrade" | "zionist") => {
    const group = new THREE.Group()

    // Increased orb size by 20%
    const orbGeometry = new THREE.SphereGeometry(0.96, 32, 32) // Was 0.8, now 0.96
    const orbMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: type === "comrade" ? new THREE.Color(0xff0000) : new THREE.Color(0x0066ff) },
        intensity: { value: type === "comrade" ? 1.0 : 0.6 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float intensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(1.0 - abs(fresnel), 2.0);
          
          float pulse = sin(time * 3.0) * 0.3 + 0.7;
          vec3 glowColor = color * intensity * pulse * (fresnel + 0.5);
          
          gl_FragColor = vec4(glowColor, 0.8 + fresnel * 0.2);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const orb = new THREE.Mesh(orbGeometry, orbMaterial)
    group.add(orb)

    // Increased outer glow size by 20%
    const glowGeometry = new THREE.SphereGeometry(1.44, 16, 16) // Was 1.2, now 1.44
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: type === "comrade" ? new THREE.Color(0xff0000) : new THREE.Color(0x0066ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(1.0 - abs(fresnel), 3.0);
          float pulse = sin(time * 2.0) * 0.2 + 0.3;
          gl_FragColor = vec4(color, fresnel * pulse);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
    })

    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    group.add(glow)

    group.userData = { type, orbMaterial, glowMaterial }
    return group
  }, [])

  const createPhaserBeam = useCallback((startPos: THREE.Vector3, endPos: THREE.Vector3) => {
    const direction = new THREE.Vector3().subVectors(endPos, startPos)
    const distance = direction.length()

    // Create beam geometry
    const beamGeometry = new THREE.CylinderGeometry(0.05, 0.05, distance, 8)
    const beamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xff0000) },
        intensity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          float pulse = sin(time * 20.0) * 0.5 + 0.5;
          float core = 1.0 - smoothstep(0.0, 0.3, abs(vUv.x - 0.5));
          vec3 beamColor = color * intensity * (pulse + 0.5) * (core + 0.2);
          gl_FragColor = vec4(beamColor, core * 0.8 + 0.2);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const beam = new THREE.Mesh(beamGeometry, beamMaterial)

    // Position and orient the beam
    beam.position.copy(startPos.clone().add(endPos).multiplyScalar(0.5))
    beam.lookAt(endPos)
    beam.rotateX(Math.PI / 2)

    beam.userData = { material: beamMaterial, startTime: Date.now() }
    return beam
  }, [])

  const createShipLabel = useCallback((text: string, emblem: string, color: string) => {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")!
    canvas.width = 512
    canvas.height = 128

    // Clear background
    context.fillStyle = "rgba(0, 0, 0, 0.9)"
    context.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    context.strokeStyle = color
    context.lineWidth = 3
    context.strokeRect(5, 5, canvas.width - 10, canvas.height - 10)

    // Text
    context.fillStyle = color
    context.font = "bold 32px monospace"
    context.textAlign = "center"
    context.fillText(text, canvas.width / 2, 50)

    // Emblem
    context.font = "48px monospace"
    context.fillText(emblem, canvas.width / 2, 100)

    const texture = new THREE.CanvasTexture(canvas)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const geometry = new THREE.PlaneGeometry(8, 2)
    return new THREE.Mesh(geometry, material)
  }, [])

  const createMiniDeathStar = useCallback((scale = 0.3) => {
    const group = new THREE.Group()

    // Mini Death Star geometry
    const geometry = new THREE.SphereGeometry(scale, 32, 32)
    const positions = geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]

      if (x > scale * 0.4 && Math.sqrt(y * y + z * z) < scale * 0.5) {
        const distanceFromCenter = Math.sqrt(y * y + z * z)
        const indentation = Math.cos((distanceFromCenter * Math.PI) / (scale * 2)) * scale * 0.2
        positions[i] = x - Math.max(0, indentation)
      }
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()

    // Main body
    const bodyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x00ff41) },
        color2: { value: new THREE.Color(0x0080ff) },
        opacity: { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(1.0 - abs(fresnel), 2.0);
          
          float pulse = sin(time * 2.0) * 0.3 + 0.7;
          vec3 color = mix(color1, color2, sin(time + vPosition.y * 5.0) * 0.5 + 0.5);
          color *= fresnel * pulse;
          
          gl_FragColor = vec4(color, opacity * (fresnel + 0.3));
        }
      `,
      transparent: true,
    })

    const body = new THREE.Mesh(geometry, bodyMaterial)
    group.add(body)

    // Wireframe overlay
    const wireframeGeometry = geometry.clone()
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    })
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    wireframe.scale.set(1.02, 1.02, 1.02)
    group.add(wireframe)

    group.userData = { bodyMaterial, wireframeMaterial }
    return group
  }, [])

  const createFloatingButtons = useCallback(
    (scene: THREE.Scene) => {
      const buttons: FloatingButton[] = []
      const radius = 9

      images.forEach((img, index) => {
        const angle = (index / images.length) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(angle * 0.3) * 1.5

        const position = new THREE.Vector3(x, y, z)

        const miniDeathStar = createMiniDeathStar(0.4)
        miniDeathStar.position.copy(position)
        miniDeathStar.userData = { index, image: img }

        scene.add(miniDeathStar)

        buttons.push({
          id: index,
          position: position.clone(),
          originalPosition: position.clone(),
          image: img.src,
          title: img.title,
          mesh: miniDeathStar,
        })
      })

      buttonsRef.current = buttons
    },
    [createMiniDeathStar],
  )

  const createGlitchRipple = useCallback((scene: THREE.Scene, position: THREE.Vector3) => {
    const rippleGeometry = new THREE.RingGeometry(0.2, 5, 32)
    const rippleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x00ff41) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          float ripple = sin(dist * 20.0 - time * 30.0) * 0.5 + 0.5;
          float fade = 1.0 - smoothstep(0.0, 1.0, time / 1.2);
          float glitch = step(0.3, sin(time * 80.0 + dist * 30.0));
          gl_FragColor = vec4(color, ripple * fade * (0.7 + glitch * 0.3));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })

    const rippleMesh = new THREE.Mesh(rippleGeometry, rippleMaterial)
    rippleMesh.position.copy(position)
    rippleMesh.lookAt(0, 0, 0)
    scene.add(rippleMesh)

    const startTime = Date.now()
    const animateRipple = () => {
      const elapsed = (Date.now() - startTime) / 1000
      if (rippleMaterial.uniforms) {
        rippleMaterial.uniforms.time.value = elapsed
      }

      if (elapsed < 1.2) {
        requestAnimationFrame(animateRipple)
      } else {
        scene.remove(rippleMesh)
      }
    }
    animateRipple()
  }, [])

  const handleButtonClick = useCallback(
    (event: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return

      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      const rect = mountRef.current?.getBoundingClientRect()
      if (!rect) return

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, cameraRef.current)

      const buttonMeshes = buttonsRef.current.map((b) => b.mesh).filter(Boolean) as THREE.Object3D[]
      const intersects = raycaster.intersectObjects(buttonMeshes, true)

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object
        let buttonData = clickedObject.userData

        // Find the parent button if we clicked a child mesh
        let parent = clickedObject.parent
        while (parent && !buttonData.index && buttonData.index !== 0) {
          buttonData = parent.userData
          parent = parent.parent
        }

        if (buttonData.index !== undefined) {
          setIsGlitching(true)
          createGlitchRipple(sceneRef.current, intersects[0].point)

          setTimeout(() => {
            setSelectedImageIndex(buttonData.index)
            setIsGlitching(false)
          }, 400)
        }
      }
    },
    [createGlitchRipple],
  )

  const handleNextShrine = useCallback(() => {
    if (selectedImageIndex === null) return

    const nextIndex = (selectedImageIndex + 1) % images.length
    setSelectedImageIndex(nextIndex)

    if (controlsRef.current && buttonsRef.current[nextIndex]) {
      const targetButton = buttonsRef.current[nextIndex]
      const targetPosition = targetButton.position.clone().normalize().multiplyScalar(15)

      const startPosition = cameraRef.current!.position.clone()
      const startTime = Date.now()
      const duration = 800

      const animateCamera = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)

        cameraRef.current!.position.lerpVectors(startPosition, targetPosition, easeProgress)
        cameraRef.current!.lookAt(0, 0, 0)

        if (progress < 1) {
          requestAnimationFrame(animateCamera)
        }
      }
      animateCamera()
    }
  }, [selectedImageIndex])

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 1)
    mountRef.current.appendChild(renderer.domElement)

    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera

    // Enhanced starfield
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 30000
    const positions = new Float32Array(starsCount * 3)
    const colors = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000

      colors[i * 3] = Math.random() * 0.5
      colors[i * 3 + 1] = Math.random() * 0.8 + 0.2
      colors[i * 3 + 2] = Math.random() * 0.3
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const starsMaterial = new THREE.PointsMaterial({
      size: 3,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    })

    const stars = new THREE.Points(starsGeometry, starsMaterial)
    scene.add(stars)

    // Create Death Star globe
    const globeGeometry = createDeathStarGeometry()
    const globeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x00ff41) },
        color2: { value: new THREE.Color(0x0080ff) },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          float fresnel = dot(vNormal, vec3(0.0, 0.0, 1.0));
          fresnel = pow(1.0 - abs(fresnel), 2.0);
          
          float grid = abs(sin(vPosition.x * 15.0 + time)) * abs(sin(vPosition.y * 15.0 + time)) * abs(sin(vPosition.z * 15.0 + time));
          grid = step(0.85, grid);
          
          vec3 color = mix(color1, color2, sin(time + vPosition.y) * 0.5 + 0.5);
          color *= fresnel + grid * 0.7;
          
          gl_FragColor = vec4(color, 0.8 + grid * 0.2);
        }
      `,
      transparent: true,
    })

    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    globe.scale.set(0.1, 0.1, 0.1)
    globe.position.z = -100
    scene.add(globe)
    globeRef.current = globe

    // Warp entrance
    const warpDuration = 1400
    const startTime = Date.now()

    const warpAnimation = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / warpDuration, 1)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      globe.scale.setScalar(0.1 + easeProgress * 0.9)
      globe.position.z = -100 + easeProgress * 100

      if (progress < 1) {
        requestAnimationFrame(warpAnimation)
      } else {
        setHasEntered(true)
      }
    }
    warpAnimation()

    // Wireframe overlay
    const wireframeGeometry = createDeathStarGeometry()
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff41,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })
    const wireframeGlobe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    wireframeGlobe.scale.set(1.04, 1.04, 1.04)
    scene.add(wireframeGlobe)

    createFloatingButtons(scene)

    // Create glowing orb ships with labels
    const comradeShip = createGlowingOrb("comrade")
    const zionistShip = createGlowingOrb("zionist")

    // Create labels with tracking lines
    const comradeLabel = createShipLabel("COMRADBADDIE", "🛠", "#ff4444")
    const zionistLabel = createShipLabel("ZIONESE PIRATES", "🇮🇱", "#4488ff")

    // Create tracking lines
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 5, 0),
    ])
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.6 })
    const comradeLine = new THREE.Line(lineGeometry, lineMaterial)
    const zionistLine = new THREE.Line(lineGeometry, lineMaterial.clone())

    comradeLabel.position.set(0, 5, 0)
    zionistLabel.position.set(0, 5, 0)

    comradeShip.add(comradeLine)
    comradeShip.add(comradeLabel)
    zionistShip.add(zionistLine)
    zionistShip.add(zionistLabel)

    scene.add(comradeShip)
    scene.add(zionistShip)

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0x004400, 0.6)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ff41, 1.5, 100)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    camera.position.set(0, 0, 15)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.3
    controls.enableZoom = true
    controls.minDistance = 10
    controls.maxDistance = 30
    controlsRef.current = controls

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      if (globeMaterial.uniforms) {
        globeMaterial.uniforms.time.value = time
      }

      // Update mini Death Stars
      buttonsRef.current.forEach((button, index) => {
        if (button.mesh?.userData.bodyMaterial) {
          button.mesh.userData.bodyMaterial.uniforms.time.value = time
        }

        // Slow orbital rotation
        const angle = (index / images.length) * Math.PI * 2 + time * 0.1
        const radius = 9
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(angle * 0.3 + time * 0.2) * 1.5

        if (button.mesh) {
          button.mesh.position.set(x, y, z)
          button.mesh.rotation.y += 0.01
        }
      })

      // Update ship orbs and materials
      if (comradeShip.userData.orbMaterial) {
        comradeShip.userData.orbMaterial.uniforms.time.value = time
        comradeShip.userData.glowMaterial.uniforms.time.value = time
      }
      if (zionistShip.userData.orbMaterial) {
        zionistShip.userData.orbMaterial.uniforms.time.value = time
        zionistShip.userData.glowMaterial.uniforms.time.value = time
      }

      // Slower, more ritualistic ship movement with spline curves
      const comradeRadius = 35
      const zionistRadius = 32
      const comradeSpeed = time * 0.15
      const zionistSpeed = time * 0.18

      // Add spline curves for more organic movement
      const comradeX = Math.cos(comradeSpeed) * comradeRadius + Math.sin(comradeSpeed * 2.3) * 3
      const comradeY = Math.sin(comradeSpeed * 0.4) * 10 + Math.cos(comradeSpeed * 1.7) * 2
      const comradeZ = Math.sin(comradeSpeed) * comradeRadius + Math.cos(comradeSpeed * 1.9) * 4

      const zionistX = Math.cos(zionistSpeed) * zionistRadius + Math.sin(zionistSpeed * 2.1) * 2
      const zionistY = Math.sin(zionistSpeed * 0.5) * 8 + Math.cos(zionistSpeed * 1.5) * 3
      const zionistZ = Math.sin(zionistSpeed) * zionistRadius + Math.cos(zionistSpeed * 2.2) * 3

      comradeShip.position.set(comradeX, comradeY, comradeZ)
      zionistShip.position.set(zionistX, zionistY, zionistZ)

      // Make ships face each other
      comradeShip.lookAt(zionistShip.position)
      zionistShip.lookAt(comradeShip.position)

      // Ensure labels always face camera
      comradeLabel.lookAt(camera.position)
      zionistLabel.lookAt(camera.position)

      // Phaser cannon firing logic
      if (Math.sin(time * 2) > 0.8 && Math.random() < 0.1) {
        const beam = createPhaserBeam(comradeShip.position, zionistShip.position)
        scene.add(beam)
        phaserBeamsRef.current.push(beam)
      }

      // Update and cleanup phaser beams
      phaserBeamsRef.current = phaserBeamsRef.current.filter((beam) => {
        const elapsed = (Date.now() - beam.userData.startTime) / 1000
        if (beam.userData.material.uniforms) {
          beam.userData.material.uniforms.time.value = elapsed
        }

        if (elapsed > 0.5) {
          scene.remove(beam)
          return false
        }
        return true
      })

      globe.rotation.y += 0.002
      wireframeGlobe.rotation.y += 0.001
      stars.rotation.y += 0.0005

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    renderer.domElement.addEventListener("click", handleButtonClick)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      renderer.domElement.removeEventListener("click", handleButtonClick)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      controls.dispose()
    }
  }, [
    createDeathStarGeometry,
    createFloatingButtons,
    createGlowingOrb,
    createShipLabel,
    createPhaserBeam,
    handleButtonClick,
  ])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <GlitchTitle />
      <div ref={mountRef} className="absolute inset-0" />

      {selectedImageIndex !== null && (
        <ImageModal
          src={images[selectedImageIndex].src || "/placeholder.svg"}
          title={images[selectedImageIndex].title}
          onClose={() => setSelectedImageIndex(null)}
          onNext={handleNextShrine}
        />
      )}

      {isGlitching && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-green-400 opacity-15 animate-pulse" />
        </div>
      )}

      {hasEntered && (
        <div className="absolute bottom-4 left-4 text-green-400 font-mono text-xs md:text-sm space-y-1 opacity-90">
          <div>ORBITAL DEFENSE: ACTIVE</div>
          <div>COMRADBADDIE: ENGAGING</div>
          <div>ZIONESE PIRATES: DETECTED</div>
          <div>SHRINE SENTRIES: 6 ACTIVE</div>
        </div>
      )}

      {/* Heartfelt message in lower right corner */}
      {hasEntered && (
        <div className="absolute bottom-4 right-4 text-green-400 font-mono text-xs opacity-80 text-right max-w-xs">
          <div className="bg-black bg-opacity-60 border border-green-400 rounded p-2">
            <div>Made with lots of ❤️ and 🇮🇱 😭</div>
            <div className="mt-1">Your loyal subject jq in Lebanon</div>
          </div>
        </div>
      )}
    </div>
  )
}
