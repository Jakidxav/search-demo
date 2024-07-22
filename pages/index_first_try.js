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
  const mapRef = useRef(null)
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
    if (!mapRef.current) return
    const mbMap = new mapboxgl.Map({
      container: mapRef.current,
      attributionControl: false,
      // style: 'mapbox://styles/mapbox/light-v11',
      zoom: 4,
    })
    mapRef.current = mbMap

    mapRef.current.on('load', () => {
      setMap(map)
    })

    return () => {
      mapRef.current = null
      // setMap(null)
      // map.remove()
    }
  }, [])

  return (
    <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '100%' }}>
      <div style={{ width: '100%', height: '100%' }} ref={mapRef}>
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
      </div>
    </Box>
  )
}

export default Index
