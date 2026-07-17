// Industrial nameplate — machines carry manufacturing plates; so does this
// site. Stamped at build time (vite.config.js define). When `onActivate` is
// provided, pressing the plate flips the site into blueprint mode.
const BUILD = typeof __BUILD_INFO__ !== 'undefined' ? __BUILD_INFO__ : { sha: 'dev', builtAt: '' }

export default function Nameplate({ dataSync, onActivate }) {
  const fields = (
    <>
      <span>UNIT PORTFOLIO-01</span>
      {BUILD.builtAt && <span>BUILT {BUILD.builtAt}</span>}
      <span>SHA {BUILD.sha}</span>
      {dataSync && <span>DATA {dataSync}</span>}
      <span className="hidden sm:inline sm:ml-auto">DHAKA · 23.8103°N 90.4125°E</span>
    </>
  )

  const className =
    'w-full flex flex-wrap items-center gap-x-6 gap-y-1 py-4 border-t border-line mono-data text-[11px] text-ink-faint text-left'

  if (!onActivate) return <div className={className}>{fields}</div>
  return (
    <button
      onClick={onActivate}
      title="Blueprint mode — inspect the construction"
      className={`${className} cursor-pointer hover:text-ink-dim transition-colors duration-240`}
    >
      {fields}
    </button>
  )
}
