import { useState, useEffect, useRef } from 'react'
import { Box, useThemeUI } from 'theme-ui'
import mapboxgl from 'mapbox-gl'
import { Dimmer } from '@carbonplan/components'
import { useThemedColormap } from '@carbonplan/colormaps'

import { Map, Raster, Fill, Line } from '@carbonplan/maps'
import Point from '../components/point'
import LineMinZoom from '../components/line-min-zoom'
import FillMinZoom from '../components/fill-min-zoom'
import ParameterControls from '../components/parameter-controls'

const bucket = 'https://carbonplan-maps.s3.us-west-2.amazonaws.com/'

const Index = () => {
  const container = useRef(null)
  const [map, setMap] = useState(null)
  const [ready, setReady] = useState(null)
  const { theme } = useThemeUI()
  const [clim, setClim] = useState([0.0, 0.5])
  const [variable, setVariable] = useState("drought")
  const [colormapName, setColormapName] = useState('warm')
  const [band, setBand] = useState(1.5)

  const [zoom, setZoom] = useState(1)

  const colormap = (variable == 'lethal_heat_3d') ? useThemedColormap(colormapName, { count: 7 }).slice(0,).reverse() :
    (variable.startsWith('tavg')) ? useThemedColormap(colormapName).slice(0,).reverse() :
      (variable.startsWith('tc')) ? useThemedColormap(colormapName).slice(0,).reverse() :
        (variable == 'slr') || (variable == 'slr_3d') ? useThemedColormap(colormapName).slice(0,).reverse() :
          useThemedColormap(colormapName)

  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [regionData, setRegionData] = useState({ loading: true })

  const glyphs = "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf"

  useEffect(() => {
    if (!container.current) return
    const mapContainer = new mapboxgl.Map({
      container: container.current,
      attributionControl: false,
      zoom: 4,
    })
    container.current = mapContainer

    map.on('load', () => {
      setReady(true)
    })

    return function cleanup() {
      container.current = null
      setReady(null)
      mapContainer.remove()
    }
  }, [])

  const getters = {
    clim,
    variable,
    band,
    colormapName,
  }

  const setters = {
    setClim,
    setVariable,
    setBand,
    setColormapName,
  }

  const handleEnter = () => {
    console.log(map)
  }

  return (
    <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} >
      <Map style={{ width: '100%', height: '100%', }} ref={container} zoom={zoom} glyphs={glyphs} >
        <Line
          id={'land-outline'}
          color={theme.rawColors.primary}
          source={bucket + 'basemaps/land'}
          variable={'land'}
        />

        <Fill
          id='land-fill'
          color={theme.rawColors.primary}
          source={bucket + 'basemaps/land'}
          variable={'land'}
          opacity={0.0}
          onMouseEnter={handleEnter}
        />

        <LineMinZoom
          id={'lakes-outline'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/lakes'}
          variable={'lakes'}
          minZoom={4}
          width={1.5}
          label={true}
          labelText={'NAME'}
        />

        <FillMinZoom
          id={'lakes-fill'}
          color={theme.rawColors.background}
          source={'https://storage.googleapis.com/risk-maps/search/lakes'}
          variable={'lakes'}
          minZoom={4}
          width={1.5}
          label={true}
          labelText={'NAME'}
        />

        <LineMinZoom
          id={'states'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/states'}
          variable={'states'}
          minZoom={4}
          width={1.5}
          label={true}
          labelText={'NAME'}
        />  

        <Point
          id={'populated-places'}
          color={theme.rawColors.primary}
          // source={'https://storage.googleapis.com/risk-maps/search/pop_places.geojson'}
          source={'https://storage.googleapis.com/risk-maps/search/pop_places'}
          variable={'pop_places'}
          label={true}
          labelText={'NAMEASCII'}
        />

        <Point
          id={'airports'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/airports'}
          variable={'airports'}
          label={true}
          labelText={'NAME'}
        />

        <Raster
          id='raster'
          key={variable}
          colormap={colormap}
          clim={clim}
          mode={(variable == 'lethal_heat_3d') ? 'grid' : 'texture'} // 'texture', 'grid', 'dotgrid'            
          source={`https://storage.googleapis.com/risk-maps/zarr_layers/${variable}.zarr`}
          variable={variable}
          selector={{ band }}
          regionOptions={{ setData: setRegionData }}
        />

        <ParameterControls getters={getters} setters={setters} />

        <Dimmer
          sx={{
            display: ['initial', 'initial', 'initial', 'initial'],
            position: 'absolute',
            color: 'primary',
            right: [13],
            bottom: [17, 17, 15, 15],
          }}
        />
      </Map>
    </Box>
  )
}

export default Index