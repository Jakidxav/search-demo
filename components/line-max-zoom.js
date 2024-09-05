import { useEffect, useRef } from 'react'
import { useMapbox } from '@carbonplan/maps'
import { v4 as uuidv4 } from 'uuid'

const updatePaintProperty = (map, ref, key, value) => {
    const { current: id } = ref
    if (map.getLayer(id)) {
      map.setPaintProperty(id, key, value)
    }
  }

const LineMaxZoom = ({
  source,
  variable,
  color,
  id,
  maxZoom = 5,
  opacity = 1,
  blur = 0.4,
  width = 0.5,
  label = false, 
  labelText = null,
  filter = null,
}) => {
  const { map } = useMapbox()
  const removed = useRef(false)

  const sourceIdRef = useRef()
  const layerIdRef = useRef()

  useEffect(() => {
    map.on('remove', () => {
      removed.current = true
    })
  }, [])

  useEffect(() => {
    sourceIdRef.current = id || uuidv4()
    const { current: sourceId } = sourceIdRef
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'vector',
        tiles: [`${source}/{z}/{x}/{y}.pbf`],
      })
      if (maxZoom) {
        map.getSource(sourceId).maxzoom = maxZoom
      }
    }
  }, [id])

  useEffect(() => {
    const layerId = layerIdRef.current || uuidv4()
    layerIdRef.current = layerId
    const { current: sourceId } = sourceIdRef
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        'source-layer': variable,
        layout: { visibility: 'visible' },
        paint: {
          'line-blur': blur,
          'line-color': color,
          'line-opacity': opacity,
          'line-width': width,
        },
        'maxzoom': maxZoom,
      })
    }

    return () => {
      if (!removed.current) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
      }
    }
  }, [])

  useEffect(() => {
    updatePaintProperty(map, layerIdRef, 'line-color', color)
  }, [color])

  useEffect(() => {
    updatePaintProperty(map, layerIdRef, 'line-opacity', opacity)
  }, [opacity])

  useEffect(() => {
    updatePaintProperty(map, layerIdRef, 'line-width', width)
  }, [width])

  useEffect(() => {
    updatePaintProperty(map, layerIdRef, 'line-blur', blur)
  }, [blur])

  return null
}

export default LineMaxZoom