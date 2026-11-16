import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Crosshair, LocateFixed, MapPin, Sparkles } from 'lucide-react'
import Modal from './Modal'
import { analyzeReportText, createItem, geocodeLocation } from '../services/api'
import useLeafletMap from '../hooks/useLeafletMap'

const CATEGORIES = ['Wallet / Bag', 'ID / Document', 'Gadget', 'Keys', 'Pet', 'Other']

const EMPTY_FORM = {
  type: 'LOST',
  title: '',
  description: '',
  category: CATEGORIES[0],
  location_name: '',
  contact_info: '',
  latitude: undefined,
  longitude: undefined,
}

export default function ReportModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [geoState, setGeoState] = useState(null) // null | 'locating' | error message
  const [aiLoading, setAiLoading] = useState(false)
  const [aiApplied, setAiApplied] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [geoLookup, setGeoLookup] = useState(null) // null | 'looking' | result/fallback message
  const { containerRef, mapRef } = useLeafletMap({ invalidateOnMount: true })
  const pickerMarkerRef = useRef(null)

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleAutoFill() {
    if (form.description.trim().length < 10 || aiLoading) return
    setAiLoading(true)
    setAiError(null)
    try {
      const suggestion = await analyzeReportText(form.description, form.type)
      setForm((f) => ({
        ...f,
        title: suggestion.suggested_title || f.title,
        category: suggestion.suggested_category || f.category,
        // Never overwrite text the user already typed.
        location_name: f.location_name || suggestion.suggested_location || f.location_name,
      }))
      setAiApplied(true)
    } catch (e) {
      setAiError(e.message || 'Could not generate a suggestion. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  // Let the user click the map to drop or move a pin.
  const setPin = useCallback((lat, lng) => {
    const map = mapRef.current
    if (!map) return
    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([lat, lng])
    } else {
      pickerMarkerRef.current = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#1a1918',
        weight: 2,
        fillColor: '#1a1918',
        fillOpacity: 0.8,
      }).addTo(map)
    }
    setForm((f) => ({ ...f, latitude: lat, longitude: lng }))
  }, [mapRef])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handleMapClick = (e) => setPin(e.latlng.lat, e.latlng.lng)
    map.on('click', handleMapClick)
    return () => map.off('click', handleMapClick)
  }, [mapRef, setPin])

  function clearPin() {
    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove()
      pickerMarkerRef.current = null
    }
    setForm((f) => ({ ...f, latitude: undefined, longitude: undefined }))
  }

  async function handleFindOnMap() {
    const query = form.location_name.trim()
    if (!query || geoLookup === 'looking') return
    setGeoLookup('looking')
    try {
      const result = await geocodeLocation(query)
      if (result) {
        setPin(result.latitude, result.longitude)
        const map = mapRef.current
        if (map) map.setView([result.latitude, result.longitude], 15)
        setGeoLookup(null)
      } else {
        setGeoLookup('No map match found — you can click the map to pin it manually.')
      }
    } catch {
      setGeoLookup('Could not look up that location — you can click the map to pin it manually.')
    }
  }

  function handleUseCurrentLocation() {
    if (!('geolocation' in navigator)) {
      setGeoState('Location services are not available in this browser.')
      return
    }
    setGeoState('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPin(latitude, longitude)
        const map = mapRef.current
        if (map) map.setView([latitude, longitude], 15)
        setGeoState(null)
      },
      (err) => {
        setGeoState(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. You can click the map instead.'
            : err.code === err.TIMEOUT
              ? 'Getting your location timed out. Try again or click the map.'
              : 'Your location could not be determined. Try again or click the map.'
        )
      },
      { timeout: 10000 }
    )
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    if (!form.location_name.trim()) next.location_name = 'Location or landmark is required.'
    if (!form.contact_info.trim()) next.contact_info = 'Contact information is required.'
    if (form.latitude != null && form.longitude != null) {
      const { latitude, longitude } = form
      if (
        typeof latitude !== 'number' || typeof longitude !== 'number' ||
        !isFinite(latitude) || !isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
      ) {
        next.coords = 'The map pin has invalid coordinates. Please pick the point again.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    try {
      const item = await createItem({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        location_name: form.location_name.trim(),
        contact_info: form.contact_info.trim(),
        latitude: form.latitude ?? null,
        longitude: form.longitude ?? null,
      })
      setForm(EMPTY_FORM)
      clearPin()
      onCreated(item)
    } catch (err) {
      setErrors({ submit: err.message || 'Could not submit the report. Try again.' })
      setSubmitting(false)
    }
  }

  const inputCls =
    'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink'
  const labelCls = 'block text-[12px] font-medium text-ink'

  return (
    <Modal title="Report an Item" onClose={onClose} wide>
      <form onSubmit={handleSubmit} noValidate className="px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="r-type" className={labelCls}>Report type</label>
            <select id="r-type" value={form.type} onChange={(e) => set('type', e.target.value)} className={`mt-1 ${inputCls}`}>
              <option value="LOST">I lost something</option>
              <option value="FOUND">I found something</option>
            </select>
          </div>
          <div>
            <label htmlFor="r-category" className={labelCls}>Category</label>
            <select id="r-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={`mt-1 ${inputCls}`}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="r-desc" className={labelCls}>Description</label>
          <textarea
            id="r-desc" rows={3} value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What it looks like, when it was lost or found, any identifying details"
            aria-invalid={!!errors.description}
            className={`mt-1 w-full rounded-md border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink ${errors.description ? 'border-lost' : 'border-line'}`}
          />
          {errors.description && <p className="mt-1 text-[12px] text-lost" role="alert">{errors.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={form.description.trim().length < 10 || aiLoading}
              title="Generate a title and category from your description (demo only)"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12px] text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={13} aria-hidden="true" />
              {aiLoading ? 'Analyzing text…' : 'Auto-fill title & category'}
            </button>
            {aiApplied && !aiLoading && (
              <span className="text-[12px] text-ink-soft">Suggestion applied — review fields before submitting.</span>
            )}
          </div>
          {aiError && <p className="mt-1 text-[12px] text-lost" role="alert">{aiError}</p>}
        </div>

        <div className="mt-3">
          <label htmlFor="r-title" className={labelCls}>Title</label>
          <input
            id="r-title" type="text" value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Black leather wallet near Central Library"
            aria-invalid={!!errors.title}
            className={`mt-1 ${inputCls} ${errors.title ? 'border-lost' : ''}`}
          />
          {errors.title && <p className="mt-1 text-[12px] text-lost" role="alert">{errors.title}</p>}
        </div>

        <div className="mt-3">
          <label htmlFor="r-location" className={labelCls}>Location or landmark</label>
          <div className="mt-1 flex gap-2">
            <input
              id="r-location" type="text" value={form.location_name}
              onChange={(e) => set('location_name', e.target.value)}
              placeholder="e.g. Main Metro Station, North Gate"
              aria-invalid={!!errors.location_name}
              className={inputCls}
            />
            <button
              type="button"
              onClick={handleFindOnMap}
              disabled={!form.location_name.trim() || geoLookup === 'looking'}
              title="Search the location on the map"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12px] text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocateFixed size={13} aria-hidden="true" />
              {geoLookup === 'looking' ? 'Searching…' : 'Find on map'}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-ink-soft">
            "Find on map" sends the typed location text to OpenStreetMap Nominatim.
          </p>
          {geoLookup && geoLookup !== 'looking' && (
            <p className="mt-1 text-[12px] text-lost" role="alert">{geoLookup}</p>
          )}
          {errors.location_name && <p className="mt-1 text-[12px] text-lost" role="alert">{errors.location_name}</p>}
        </div>

        <div className="mt-3">
          <label htmlFor="r-contact" className={labelCls}>Contact information</label>
          <input
            id="r-contact" type="text" value={form.contact_info}
            onChange={(e) => set('contact_info', e.target.value)}
            placeholder="e.g. you@example.com / 555-010-0000"
            aria-invalid={!!errors.contact_info}
            className={`mt-1 ${inputCls} ${errors.contact_info ? 'border-lost' : ''}`}
          />
          {errors.contact_info && <p className="mt-1 text-[12px] text-lost" role="alert">{errors.contact_info}</p>}
        </div>

        <div className="mt-3">
          <span className={labelCls}>Pin the spot (optional)</span>
          <div className="mt-1 h-52 overflow-hidden rounded-md border border-line">
            <div ref={containerRef} className="h-full w-full" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={geoState === 'locating'}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12px] text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Crosshair size={13} aria-hidden="true" />
              {geoState === 'locating' ? 'Locating…' : 'Use Current Location'}
            </button>
            {form.latitude != null && form.longitude != null ? (
              <span className="inline-flex items-center gap-1 text-[12px] text-ink">
                <MapPin size={12} aria-hidden="true" />
                Pin set ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
                <button type="button" onClick={clearPin} className="ml-1 underline hover:text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink">
                  Remove
                </button>
              </span>
            ) : (
              <span className="text-[12px] text-ink-soft">No map pin attached — click the map to add one.</span>
            )}
          </div>
          {geoState && geoState !== 'locating' && (
            <p className="mt-1 text-[12px] text-lost" role="alert">{geoState}</p>
          )}
          {errors.coords && <p className="mt-1 text-[12px] text-lost" role="alert">{errors.coords}</p>}
        </div>

        {errors.submit && (
          <p className="mt-3 rounded-md border border-lost bg-lost-bg px-3 py-2 text-[12px] text-lost" role="alert">
            {errors.submit}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-3 text-sm text-ink hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-9 items-center rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
