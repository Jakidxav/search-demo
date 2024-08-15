import { useEffect, useRef } from 'react'
import { useMapbox } from '@carbonplan/maps'
import { v4 as uuidv4 } from 'uuid'

const updatePaintProperty = (map, ref, key, value) => {
  const { current: id } = ref
  if (map.getLayer(id)) {
    map.setPaintProperty(id, key, value)
  }
}

const FilterLayer = ({
  source,
  variable,
  color,
  id,
  minZoom = null,
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
      if (minZoom) {
        map.getSource(sourceId).minzoom = minZoom
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
        'filter': ['in', 'name', 'Indiana']
      })
    }

    setTimeout(function () {
      map.setPaintProperty(layerId, 'line-opacity', 0)
    }, 750)
    setTimeout(function () {
      map.setPaintProperty(layerId, 'line-opacity', 1);
    }, 1000)
    setTimeout(function () {
      map.setPaintProperty(layerId, 'line-opacity', 0)
    }, 1250)
    setTimeout(function () {
      map.setPaintProperty(layerId, 'line-opacity', 1);
    }, 1500)
    setTimeout(function () {
      map.setPaintProperty(layerId, 'line-opacity', 0)
    }, 1750)
    setTimeout(function () {
      map.setPaintProperty(layerId, 'line-opacity', 1);
    }, 2000)

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

export default FilterLayer