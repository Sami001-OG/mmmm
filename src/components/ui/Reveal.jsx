import { useEffect, useRef, useState } from 'react'
import useInView from '../../hooks/useInView'

/**
 * Scroll-triggered reveal. Dessau grammar: elements slide 24px on one axis
 * (no fade-and-float), once only. Under reduced motion the element renders at
 * final state immediately (the CSS reduced-motion gate zeroes the transition).
 *
 * Props:
 *  - as: element/component to render (default 'div')
 *  - delay: ms delay before the transition starts (staggered groups)
 *  - variant: 'up' | 'wipe' | 'right'
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const [ref, inView] = useInView({ once: true, threshold: 0.12 })

  const hidden = {
    up: 'opacity-0 translate-y-6',
    right: 'opacity-0 -translate-x-6',
    wipe: 'opacity-0 [clip-path:inset(0_100%_0_0)]',
  }
  const shown = 'opacity-100 translate-x-0 translate-y-0 [clip-path:inset(0_0_0_0)]'

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={[
        'transition-[transform,opacity,clip-path] duration-480 ease-machine',
        inView ? shown : hidden[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
