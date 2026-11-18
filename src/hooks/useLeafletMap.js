import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Initializes a Leaflet map once, cleans up with map.remove(), and
// exposes invalidateSize() for containers that mount inside modals.
export default function useLeafletMap({ center = [20, 0], zoom = 2, invalidateOnMount = false }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const map = L.map(containerRef.current, { center, zoom, scrollWheelZoom: true })
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)
    tiles.getContainer().style.filter = 'grayscale(100%) invert(85%) hue-rotate(180deg) brightness(85%) contrast(90%)'
    mapRef.current = map

    let timer = null
    if (invalidateOnMount) {
      // Allow the modal layout to finish rendering before sizing the map.
      timer = setTimeout(() => map.invalidateSize(), 150)
    }

    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function invalidateSize(delayed = true) {
    if (!mapRef.current) return
    if (delayed) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100)
    } else {
      mapRef.current.invalidateSize()
    }
  }

  return { containerRef, mapRef, invalidateSize }
}
