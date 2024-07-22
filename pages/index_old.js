import { useState, useEffect, useRef } from 'react'
import { Box, useThemeUI } from 'theme-ui'
import mapboxgl from 'mapbox-gl'
import { Dimmer } from '@carbonplan/components'
import { Map, Raster, Fill, Line, RegionPicker } from '@carbonplan/maps'
import { useThemedColormap } from '@carbonplan/colormaps'
import RegionControls from '../components/region-controls'
import ParameterControls from '../components/parameter-controls'

const bucket = 'https://carbonplan-maps.s3.us-west-2.amazonaws.com/'

const Index = () => {
  const container = useRef(null)
  const [map, setMap] = useState(null)
  const { theme } = useThemeUI()
  const [clim, setClim] = useState([0.0, 0.5])
  const [variable, setVariable] = useState("drought")
  const [colormapName, setColormapName] = useState('warm')
  const [band, setBand] = useState(1.5)

  const colormap = (variable == 'lethal_heat_3d') ? useThemedColormap(colormapName, { count: 7 }).slice(0,).reverse() : 
    (variable.startsWith('tavg')) ? useThemedColormap(colormapName).slice(0,).reverse() : 
    (variable.startsWith('tc')) ? useThemedColormap(colormapName).slice(0,).reverse() : 
    (variable == 'slr') || (variable == 'slr_3d') ? useThemedColormap(colormapName).slice(0,).reverse() : 
    useThemedColormap(colormapName)

  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [regionData, setRegionData] = useState({ loading: true })

  const getters = { 
    clim, 
    variable, 
    band, 
    colormapName 
  }

  const setters = {
    setClim,
    setVariable,
    setBand,
    setColormapName,
  }

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: container.current,
      // style: style,
      zoom: 1,
      minZoom: 1,
      maxZoom: 9,
      center: [-40, 40],
    })

    map.on('load', () => {
      setMap(map)
    })

    return function cleanup() {
      setMap(null)
      map.remove()
    }
  }, [])

  return (
    <>
      <Box ref={container} sx={{flexBasis: '100%', 'canvas.mapboxgl-canvas:focus': {outline: 'none',},}}>
        <Map zoom={2} center={[0, 0]}>
          {((variable != 'tc_rp') && (variable != 'slr_3d'))  && (
          <Fill
            color={theme.rawColors.background}
            source={bucket + 'basemaps/ocean'}
            variable={'ocean'}
          />
          )}

        {(variable == 'slr_3d')  && (
          <Fill
            color={theme.rawColors.background}
            source={bucket + 'basemaps/land'}
            variable={'land'}
          />
          )}

          <Line
            color={theme.rawColors.primary}
            source={bucket + 'basemaps/land'}
            variable={'land'}
          />

          {showRegionPicker && (
            <RegionPicker
              color={theme.colors.primary}
              backgroundColor={theme.colors.background}
              fontFamily={theme.fonts.mono}
              fontSize={'14px'}
              maxRadius={2000}
            />
          )}

          <Raster
            key={variable}
            colormap={colormap}
            clim={clim}
            mode={(variable == 'lethal_heat_3d') ? 'grid' : 'texture'} // 'texture', 'grid', 'dotgrid'            
            source={`https://storage.googleapis.com/risk-maps/zarr_layers/${variable}.zarr`}
            variable={variable}
            selector={{ band }}
            // selector={(variable == 'slr_3d') ? band : { band }}
            regionOptions={{ setData: setRegionData }}
          />

          <RegionControls
            variable={variable}
            band={band}
            regionData={regionData}
            showRegionPicker={showRegionPicker}
            setShowRegionPicker={setShowRegionPicker}
          />
        </Map>

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
      </Box>
    </>
  )
}

export default Index
