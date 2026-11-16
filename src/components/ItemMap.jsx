import { useEffect, useRef } from 'react'
import L from 'leaflet'
import useLeafletMap from '../hooks/useLeafletMap'

const COLOR = { LOST: '#D97706', FOUND: '#059669' }

function buildPopup(item, onSelect) {
  const el = document.createElement('div')
  el.style.maxWidth = '200px'
  const badge = document.createElement('span')
  badge.textContent = item.status === 'RESOLVED' ? 'RESOLVED' : item.type
  badge.style.cssText = `font-size:10px;font-weight:600;padding:1px 6px;border-radius:4px;${
    item.status === 'RESOLVED'
      ? 'background:#ececec;color:#6b6860'
      : item.type === 'LOST'
        ? 'background:#FEF3C7;color:#B45309'
        : 'background:#DCFCE7;color:#15803D'
  }`
  const title = document.createElement('div')
  title.textContent = item.title
  title.style.cssText = 'margin-top:4px;font-weight:600;font-size:13px;line-height:1.3'
  const loc = document.createElement('div')
  loc.textContent = item.location_name || ''
  loc.style.cssText = 'margin-top:2px;font-size:11px;color:#6b6860'
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.textContent = 'View details'
  btn.style.cssText = 'margin-top:6px;font-size:11px;text-decoration:underline;cursor:pointer;background:none;border:none;padding:0;color:#1a1918'
  btn.addEventListener('click', () => onSelect(item.id))
  el.append(badge, title, loc, btn)
  return el
}

export default function ItemMap({ items, focusItemId, onFocusHandled, onSelectItem }) {
  const { containerRef, mapRef, invalidateSize } = useLeafletMap({})
  const markersRef = useRef(new Map())
  const onSelectRef = useRef(onSelectItem)
  useEffect(() => {
    onSelectRef.current = onSelectItem
  }, [onSelectItem])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const layer = L.layerGroup().addTo(map)
    const markers = markersRef.current
    const withCoords = items.filter(
      (it) => it.latitude != null && it.longitude != null
    )
    for (const item of withCoords) {
      const marker = L.circleMarker([item.latitude, item.longitude], {
        radius: 7,
        color: '#ffffff',
        weight: 1.5,
        fillColor: COLOR[item.type] || '#6b6860',
        fillOpacity: item.status === 'RESOLVED' ? 0.4 : 0.95,
      })
      marker.bindPopup(buildPopup(item, (id) => onSelectRef.current?.(id)))
      marker.addTo(layer)
      markers.set(item.id, marker)
    }
    // Frame pins from any city cleanly; focus flyTo below still wins after this.
    if (withCoords.length > 0) {
      map.fitBounds(
        L.latLngBounds(withCoords.map((it) => [it.latitude, it.longitude])),
        { padding: [24, 24], maxZoom: 15 }
      )
    }
    return () => {
      layer.remove()
      markers.clear()
    }
  }, [items, mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map || focusItemId == null) return
    const marker = markersRef.current.get(focusItemId)
    if (marker) {
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: 0.5 })
      marker.openPopup()
    }
    onFocusHandled?.()
  }, [focusItemId, mapRef, onFocusHandled])

  useEffect(() => {
    invalidateSize()
  }, [invalidateSize])

  return <div ref={containerRef} className="h-full w-full" aria-label="Map of reported items" />
}
