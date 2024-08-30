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
  label = false,
  labelText = null,
  filter = null,
  type,
  place
}) => {
  const { map } = useMapbox()
  const removed = useRef(false)

  const sourceIdRef = useRef()
  const layerIdRef = useRef()

  console.log(source)
  console.log(place)
  console.log(place.split(/[ ,]+/))
  let opacityProperty = type == 'line' ? 'line-opacity' : 'circle-opacity'
  let colorProperty = type == 'line' ? 'line-color' : 'circle-color'
  let widthProperty = type == 'line' ? 'line-width' : 'circle-radius'
  let width = 4

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
    console.log(layerId)
    const { current: sourceId } = sourceIdRef
    if (!map.getLayer(layerId)) {
      let tempLayer
      if (type == 'circle') {
        let split = place.split(/[ ,]+/)
        let city = split[0]
        let state = split[1]
        tempLayer = map.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          'source-layer': variable,
          layout: { visibility: 'visible' },
          paint: {
            'circle-color': color,
            'circle-opacity': opacity,
            'circle-radius': 4,
            'circle-stroke-color': color,
            'circle-stroke-width': 4,
            'circle-stroke-opacity': opacity,

          },
          // 'filter': {['==', 'NAMEASCII', 'Seattle']}
          "filter": ["all",
            ["==", "NAMEASCII", city],
            // ["in", "ADM1NAME", 'WA']
          ]
        })
      } else {
        console.log("I should be adding the line layer to the map!")
        tempLayer = map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          'source-layer': variable,
          layout: { visibility: 'visible' },
          paint: {
            'line-blur': 0.4,
            'line-color': color,
            'line-opacity': opacity,
            'line-width': width * 2,
          },
          'filter': ['in', 'name', 'Washington'] 
          // for states, the filter is this ^^
          // for counties, the filter is: ['in', 'NAME', '...'] 
          // I also need to look to see whether I can set this effect to run on map idle
          // https://docs.mapbox.com/mapbox-gl-js/api/map/#map#idle
        })
      }
    }

    if(type == 'circle') {
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 0)
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 0)
      }, 750)
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 1);
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 1)
      }, 1000)
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 0)
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 0)
      }, 1250)
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 1);
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 1)
      }, 1500)
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 0)
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 0)
      }, 1750)
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 1);
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 1)
      }, 2000)
      setTimeout(function () {
        map.setPaintProperty(layerId, 'circle-opacity', 0);
        map.setPaintProperty(layerId, 'circle-stroke-opacity', 0)
      }, 2250)
    } else {
      console.log("Should be styling the line!")
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
      setTimeout(function () {
        map.setPaintProperty(layerId, 'line-opacity', 0);
      }, 2250)
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
    updatePaintProperty(map, layerIdRef, colorProperty, color)
  }, [color])

  useEffect(() => {
    updatePaintProperty(map, layerIdRef, opacityProperty, opacity)
  }, [opacity])

  useEffect(() => {
    updatePaintProperty(map, layerIdRef, widthProperty, width)
  }, [width])

  return null
}

export default FilterLayer