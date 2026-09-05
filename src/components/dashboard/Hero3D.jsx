import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Hero3D — Flat Bauhaus Match.
 * Same poster as KineticComposition SVG, in real 3D: blue sphere (data),
 * red box (work), yellow extruded triangle (action). Flat Basic fills
 * (zero lights/gradients), orthographic camera, drafting edge outlines,
 * stepped mechanical motion. Transparent bg so Dessau/paper/blueprint
 * CSS shows through. Speed-first: DPR capped, pauses offscreen/hidden,
 * disposes on unmount, reduced-motion = single static frame.
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

    const [c1 = '#4C8DFF', c2 = '#E5484D', c3 = '#F5C518'] = [palette[0], palette[1], palette[2]].map(
      (c, i) => (typeof c === 'string' && c ? c : ['#4C8DFF', '#E5484D', '#F5C518'][i])
    )

    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // Orthographic — technical-drawing feel, matches the SVG poster (no foreshortening).
    // Frustum maps the poster's 400x400 viewBox: 100px = 1 world unit.
    const HALF = 2
    const camera = new THREE.OrthographicCamera(-HALF, HALF, HALF, -HALF, 0.1, 50)
    camera.position.set(0.6, 0.5, 10)
    camera.lookAt(0, 0, 0)

    // Theme edge color — resolved from the Dessau tokens so dark/paper/blueprint stay correct.
    const edgeColor = () => {
      try {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--c-line-strong').trim()
        const [r, g, b] = raw.split(/\s+/).map(Number)
        if ([r, g, b].every((n) => Number.isFinite(n))) return new THREE.Color(`rgb(${r},${g},${b})`)
      } catch { /* fallback below */ }
      return new THREE.Color('#3B3A41')
    }
    let edge = edgeColor()
    const themeObs = new MutationObserver(() => {
      edge = edgeColor()
      scene.traverse((o) => {
        if (o.isLineSegments) o.material.color.copy(edge)
      })
    })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const group = new THREE.Group()
    scene.add(group)

    const flat = (color) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color) })
    const withEdges = (mesh) => {
      const lines = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry, 20),
        new THREE.LineBasicMaterial({ color: edge.clone() })
      )
      mesh.add(lines)
      return mesh
    }

    // World mapping: svg (x,y in 0..400, y-down) -> ((x-200)/100, (200-y)/100).
    // Blue sphere — SVG circle cx150 cy270 r78.
    const sphere = withEdges(new THREE.Mesh(new THREE.SphereGeometry(0.78, 24, 16), flat(c1)))
    sphere.position.set(-0.5, -0.7, 0.2)
    group.add(sphere)

    // Red box — SVG square x230 y60 110x110 (center 285,115).
    const box = withEdges(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), flat(c2)))
    box.position.set(0.85, 0.85, -0.1)
    box.rotation.set(0.35, 0.5, 0.12)
    group.add(box)

    // Yellow triangle — SVG polygon (200,70)(300,250)(100,250), extruded for depth.
    const triShape = new THREE.Shape()
    triShape.moveTo(0, 1.3)
    triShape.lineTo(1.0, -0.5)
    triShape.lineTo(-1.0, -0.5)
    triShape.closePath()
    const triGeo = new THREE.ExtrudeGeometry(triShape, { depth: 0.35, bevelEnabled: false })
    triGeo.center()
    const tri = withEdges(new THREE.Mesh(triGeo, flat(c3)))
    tri.position.set(0, 0.35, 0.3)
    tri.rotation.set(0.12, 0, 0.08)
    group.add(tri)

    const resize = () => {
      const w = mount.clientWidth || 340
      const h = mount.clientHeight || 340
      renderer.setSize(w, h, false)
      const aspect = w / h
      camera.left = -HALF * aspect
      camera.right = HALF * aspect
      camera.top = HALF
      camera.bottom = -HALF
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    // Interaction: drag-to-rotate with 15° snap on release + subtle pointer parallax.
    const SNAP = Math.PI / 12
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
      parX = ((e.clientX - r.left) / r.width - 0.5) * 2
      parY = ((e.clientY - r.top) / r.height - 0.5) * 2
      if (!dragging) return
      const dx = (e.clientX ?? px) - px
      const dy = (e.clientY ?? py) - py
      px = e.clientX ?? px
      py = e.clientY ?? py
      targetRY += dx * 0.006
      targetRX = Math.max(-0.9, Math.min(0.9, targetRX + dy * 0.004))
    }
    const onUp = () => {
      dragging = false
      // Mechanical snap — Dessau stepped motion, not free spin.
      targetRY = Math.round(targetRY / SNAP) * SNAP
      targetRX = Math.round(targetRX / SNAP) * SNAP
    }
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

    // Stepped gear idle — 8 steps per 6s cycle, like the site's gear-step token.
    const GEAR_STEPS = 8
    const GEAR_CYCLE = 6000
    const startT = performance.now()

    const renderFrame = (t) => {
      curRX += (targetRX - curRX) * 0.08
      curRY += (targetRY - curRY) * 0.08
      group.rotation.x = curRX + parY * 0.05
      group.rotation.y = curRY + parX * 0.08
      if (!reduceMotion && !dragging) {
        const step = Math.floor((t - startT) / (GEAR_CYCLE / GEAR_STEPS)) % GEAR_STEPS
        const idle = (step / GEAR_STEPS) * (Math.PI / 4)
        box.rotation.y = 0.5 + idle * 0.25
        tri.rotation.y = idle * 0.2
        tri.position.y = 0.35 + (step % 2 === 0 ? 0.015 : -0.015)
      }
      renderer.render(scene, camera)
    }

    if (reduceMotion) {
      renderFrame(startT) // single static frame, no loop
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
      themeObs.disconnect()
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
