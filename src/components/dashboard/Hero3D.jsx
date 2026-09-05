import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Hero3D — Interactive Bauhaus 3D, speed-first.
 * Clean artifact: blue sphere (data), red box (work), yellow tetra (action)
 * + subtle accent ring. No grid plane, no construction lines.
 * - Vanilla three only (no fiber/drei) to keep bundle minimal.
 * - Transparent renderer so Dessau/paper/blueprint CSS bg shows through.
 * - DPR capped 1-1.75, pauses offscreen / tab-hidden, disposes on unmount.
 * - Reduced-motion or WebGL failure: renders single static frame, no loop.
 */
export default function Hero3D({ palette = [], onReady }) {
  const mountRef = useRef(null)
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined
    if (typeof window === 'undefined') return undefined

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return undefined // SVG poster underneath stays visible
    }

    const [c1 = '#4C8DFF', c2 = '#E5484D', c3 = '#F5C518'] = [
      palette[0],
      palette[1],
      palette[2],
    ].map((c) => (typeof c === 'string' && c ? c : undefined)).map((c, i) => c || ['#4C8DFF', '#E5484D', '#F5C518'][i])

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.4, 7.2)

    // Lights — soft studio, no bloom/glow to preserve flat Dessau look.
    scene.add(new THREE.AmbientLight(0xffffff, 0.85))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(3, 5, 4)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.45)
    fill.position.set(-4, -2, 3)
    scene.add(fill)

    const group = new THREE.Group()
    scene.add(group)

    const mat = (color) =>
      new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.55, metalness: 0.08 })

    // Blue sphere — focal mass (left-low in SVG at ~150,270)
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.05, 48, 32), mat(c1))
    sphere.position.set(-1.05, -0.75, 0.2)
    group.add(sphere)

    // Red box — work (right-high in SVG)
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.35, 1.35), mat(c2))
    box.position.set(1.15, 0.85, -0.1)
    box.rotation.set(0.35, 0.5, 0.12)
    group.add(box)

    // Yellow tetra — action (top-center triangle in SVG)
    const tetra = new THREE.Mesh(new THREE.TetrahedronGeometry(1.05), mat(c3))
    tetra.position.set(0.1, 1.15, 0.35)
    tetra.rotation.set(0.2, 0, 0.35)
    group.add(tetra)

    // Accent ring — outline circle for depth (SVG small ring at 300,300)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.025, 12, 64),
      new THREE.MeshBasicMaterial({ color: 0xf2f0eb, transparent: true, opacity: 0.85 })
    )
    ring.position.set(1.7, -1.25, 0.5)
    group.add(ring)

    const resize = () => {
      const w = mount.clientWidth || 340
      const h = mount.clientHeight || 340
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    // Interaction: drag-to-rotate (damped) + pointer parallax.
    let targetRX = 0.08
    let targetRY = -0.12
    let curRX = targetRX
    let curRY = targetRY
    let dragging = false
    let px = 0
    let py = 0
    let parX = 0
    let parY = 0

    const onDown = (e) => {
      dragging = true
      px = e.clientX ?? 0
      py = e.clientY ?? 0
    }
    const onMove = (e) => {
      const r = mount.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
      parX = nx
      parY = ny
      if (!dragging) return
      const dx = (e.clientX ?? px) - px
      const dy = (e.clientY ?? py) - py
      px = e.clientX ?? px
      py = e.clientY ?? py
      targetRY += dx * 0.006
      targetRX += dy * 0.004
      targetRX = Math.max(-0.9, Math.min(0.9, targetRX))
    }
    const onUp = () => { dragging = false }
    mount.style.touchAction = 'pan-y'
    mount.style.cursor = 'grab'
    mount.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    let raf = 0
    let visible = true
    let inView = true
    const io = new IntersectionObserver(
      (entries) => { inView = entries[0]?.isIntersecting ?? true },
      { threshold: 0.05 }
    )
    io.observe(mount)
    const onVis = () => { visible = document.visibilityState === 'visible' }
    document.addEventListener('visibilitychange', onVis)

    const renderFrame = (t) => {
      curRX += (targetRX - curRX) * 0.06
      curRY += (targetRY - curRY) * 0.06
      group.rotation.x = curRX + parY * 0.08
      group.rotation.y = curRY + parX * 0.14
      if (!reduceMotion && !dragging) {
        const s = t * 0.00012
        box.rotation.y += 0.0035
        tetra.rotation.y -= 0.004
        tetra.position.y = 1.15 + Math.sin(t * 0.0011) * 0.07
        sphere.position.y = -0.75 + Math.cos(t * 0.0009) * 0.05
        ring.rotation.z += 0.002
        group.position.y = Math.sin(s * 6) * 0.04
      }
      renderer.render(scene, camera)
    }

    if (reduceMotion) {
      renderFrame(0) // single static frame, no loop
      readyRef.current?.()
    } else {
      let firstFrame = true
      const loop = (t) => {
        raf = requestAnimationFrame(loop)
        if (!visible || !inView) return
        renderFrame(t)
        if (firstFrame) {
          firstFrame = false
          readyRef.current?.()
        }
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('visibilitychange', onVis)
      mount.removeEventListener('pointerdown', onDown)
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.()
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m) => { m.map?.dispose?.(); m.dispose?.() })
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [palette?.[0], palette?.[1], palette?.[2]])

  return <div ref={mountRef} className="absolute inset-0" aria-hidden />
}
