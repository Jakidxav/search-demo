import { useState, useEffect, useRef } from 'react'
import { keyframes } from '@emotion/react'
import { Box, useColorMode, useThemeUI } from 'theme-ui'
import mapboxgl from 'mapbox-gl'
import { Dimmer } from '@carbonplan/components'
import { useThemedColormap } from '@carbonplan/colormaps'

import { Map, Raster, Fill, Line } from '@carbonplan/maps'
import Point from '../components/point'
import LineMinZoom from '../components/line-min-zoom'
import LineMaxZoom from '../components/line-max-zoom'
import FillMinZoom from '../components/fill-min-zoom'
import FilterLayer from '../components/filter-layer'
import ParameterControls from '../components/parameter-controls'

const bucket = 'https://carbonplan-maps.s3.us-west-2.amazonaws.com/'

const Index = () => {
  const { theme } = useThemeUI()
  const [colorMode, setColorMode] = useColorMode()
  
  const container = useRef(null)
  const [map, setMap] = useState(null)
  const [ready, setReady] = useState(null)

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
  const [showFilter, setShowFilter] = useState(true)
  const [showTemp, setShowTemp] = useState(false)

  const [lookup, setLookup] = useState(null)
  const [place, setPlace] = useState(null)

  const glyphs = "http://fonts.openmaptiles.org/{fontstack}/{range}.pbf"

  const fade = keyframes({
    from: {
      opacity: 1,
    },
    to: {
      opacity: 0,
    },
  })

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

  useEffect(() => {
    setColorMode('light')
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

  const filterSource = 'https://storage.googleapis.com/risk-maps/search/'

  return (
    <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }} >
      <Map style={{ width: '100%', height: '100%', }} ref={container} zoom={zoom} glyphs={glyphs} >
        <LineMaxZoom
          id={'land-outline'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/vector_layers/land'}
          variable={'land'}
          maxZoom={2.5}
        />

        <LineMinZoom
          id={'lakes-outline'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/lakes'}
          variable={'lakes'}
          minZoom={2}
          width={1.5}
          label={true}
          labelText={'name'}
        />

        <FillMinZoom
          id={'lakes-fill'}
          color={theme.rawColors.background}
          source={'https://storage.googleapis.com/risk-maps/search/lakes'}
          variable={'lakes'}
          minZoom={2}
          width={1.5}
          label={true}
          labelText={'name'}
        />

      <LineMinZoom
          id={'countries'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/countries'}
          variable={'countries'}
          minZoom={2}
          width={1.5}
          label={true}
          labelText={'name'}
        />

      <LineMinZoom
          id={'regions'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/regions'}
          variable={'regions'}
          minZoom={2}
          width={1.5}
          label={true}
          labelText={'name'}
        />

        <LineMinZoom
          id={'states'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/states'}
          variable={'states'}
          minZoom={4}
          width={1.5}
          label={true}
          labelText={'name'}
        />

        {/* <LineMinZoom
          id={'counties'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/counties'}
          variable={'counties'}
          minZoom={6}
          width={1.5}
          label={true}
          labelText={'name'}
        /> */}

        {/* <Box sx={{
            width: '300px',
            height: '300px',
            border: '2px solid red',
            position: 'absolute', 
            top: 40, 
            right: 5,
            animationDelay: '0s',
            animationDuration: '0.5s',
            animationIterationCount: 4,
            animationName: fade.toString(),
            // animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
        }}>
        </Box> */}

        {/* {showTemp && (
          <TempLayer
            id={'temp-layer'}
            variable={'states'}
            color={'red'}
            width={5}
            opacity={0}
          />
        )} */}

        <Point
          id={'cities'}
          color={theme.rawColors.primary}
          source={'https://storage.googleapis.com/risk-maps/search/cities'}
          variable={'cities'}
          label={true}
          labelText={'name'}
          minZoom={6}
        />

        {showFilter && lookup == 'counties' && (
          <FilterLayer
            key={place}
            id={'counties'}
            source={filterSource + lookup}
            variable={lookup}
            minZoom={4}
            opacity={0}
            color={theme.rawColors.primary}
            label={true}
            labelText={'name'}
            filter={null}
            type={'line'}
            place={place}
          />
        )}

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

        <ParameterControls
          getters={getters}
          setters={setters}
          showFilter={showFilter}
          setShowFilter={setShowFilter}
          showTemp={showTemp}
          setShowTemp={setShowTemp}
          lookup={lookup}
          setLookup={setLookup}
          place={place}
          setPlace={setPlace}
        />

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