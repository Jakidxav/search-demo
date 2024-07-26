import { Box } from 'theme-ui'
import { useCallback, useEffect } from 'react'
import { Badge, Button, Select, Slider } from '@carbonplan/components'
import { Reset, Search as SearchIcon } from '@carbonplan/icons'
import { useMapbox } from '@carbonplan/maps'
import  Search  from './search'

const sx = {
  label: {
    fontFamily: 'mono',
    letterSpacing: 'mono',
    textTransform: 'uppercase',
    fontSize: [1, 1, 1, 2],
    mt: [4],
  },
}

const CLIM_RANGES = {
  drought: { max: 0.5, min: 0.0 },
  hot_days: { min: 0.0, max: 365.0 },
  lethal_heat_3d: { min: 1.0, max: 4.0 },
  precip: { max: 4000, min: 0 },
  tavg: { min: -30, max: 30 },
  tc_rp: { min: 0.0, max: 100.0 },
  slr_3d: { min: -0.5, max: 0.5 },
  wdd: { min: 0.0, max: 50.0 }, // true max 70 days
  warm_nights: { min: 0.0, max: 365.0 },
}

const VARIABLE_BANDS = {
  drought: [1.5, 2.0],
  hot_days: [1.5, 2.0],
  lethal_heat_3d: [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0],
  precip: [1.5, 2.0],
  tavg: [1.5, 2.0],
  tc_rp: [2017.0, 2050.0],
  // slr: [''],
  slr_3d: [2050.0],
  wdd: [1.5, 2.0], 
  warm_nights: [1.5, 2.0],
}

const DEFAULT_COLORMAPS = {
  drought: 'warm',
  hot_days: 'fire',
  lethal_heat_3d: 'fire',
  precip: 'cool',
  tavg: 'redteal',
  tc_rp: 'fire', // water also looks good
  slr_3d: 'redteal', // tealgrey, redteal also looks good
  wdd: 'fire',
  warm_nights: 'fire',
}

const ParameterControls = ({ getters, setters }) => {
  const { 
    clim, 
    variable, 
    band, 
    colormapName,
  } = getters

  const {
    setClim,
    setVariable,
    setBand,
    setColormapName,
  } = setters

  const { map } = useMapbox()

  const handleVariableChange = useCallback((event) => {
    const variable = event.target.value
    setVariable(variable)
    setBand(VARIABLE_BANDS[variable][0]);
    setClim([CLIM_RANGES[variable].min, CLIM_RANGES[variable].max])
    setColormapName(DEFAULT_COLORMAPS[variable])
  })

  const zoomIn = () => {
    map.flyTo({
      center: [-122.32, 47.60],
      zoom: 7,
    })
  }

  const handleReset = () => {
    map.flyTo({
      center: [-40, 40],
      zoom: 1,
    })
  }

  const handleSearch = () => {
    console.log(map)
  }

  const handleSource = () => {
    console.log(map.getSource('ocean-fill-source'))
    console.log(map.getLayer('ocean-fill'))
  }

  const handleColorChange = () => {
    map.setPaintProperty('land-outline', 'line-color', 'blue')
  }

  return (
    <>
      <Box sx={{ position: 'absolute', top: 40, right: 5 }}>
        <Search />
      </Box>

      <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
      <Box sx={{ ...sx.label, mt: [2] }}>Variable</Box>
        <Select
          sxSelect={{ bg: 'transparent' }}
          size='xs'
          onChange={handleVariableChange}
          sx={{ mt: [1] }}
          value={variable}
        >
          <option value='drought'>Drought</option>
          <option value='hot_days'>Hot Days</option>
          <option value='lethal_heat_3d'>Lethal Heat</option>
          <option value='precip'>Precip</option>
          <option value='tavg'>Temp</option>
          <option value='slr_3d'>SLR</option>
          <option value='tc_rp'>Tropical Cyclone</option>
          <option value='wdd'>Wildfire</option>
          <option value='warm_nights'>Warm Nights</option>
        </Select>

        {/* 
        THIS IS THE PART THAT WILL BE DIFFICULT TO CUSTOMIZE
        I NEED TO THINK MORE ABOUT HOW TO DO THIS WITHOUT NEEDING TO WRITE EXCEPTIONS FOR EVERY VARIABLE 
        */}
        <Box sx={sx.label}>Warming level / time period</Box>
        {/* {(variable != 'slr') && ( */}
        {(variable != 'slr_3d') && (
        <Slider
          min={VARIABLE_BANDS[variable][0]}
          max={VARIABLE_BANDS[variable][VARIABLE_BANDS[variable].length - 1]}
          step={(variable == 'tc_rp') ? 33.0 : 0.5}
          sx={{ width: '175px', display: 'inline-block' }}
          value={band}
          onChange={(e) => setBand(parseFloat(e.target.value))}
        />
        )}
        <Badge
          sx={{
            bg: 'primary',
            color: 'background',
            display: 'inline-block',
            position: 'relative',
            left: [3],
            top: [1],
          }}
        >
          {/* { (variable == 'slr') ? '2050' : (variable == 'tc_rp') ? band : band.toFixed(1) } */}
          { (variable == 'slr_3d') || (variable == 'tc_rp') ? band.toFixed(0) : band.toFixed(1) }
        </Badge>

        <Box sx={sx.label}>Minimum</Box>
        <Slider
          min={CLIM_RANGES[variable].min}
          max={CLIM_RANGES[variable].max}
          step={(variable == 'precip') ? 1.0 : 0.01}
          sx={{ width: '175px', display: 'inline-block' }}
          value={clim[0]}
          onChange={(e) =>
            setClim((prev) => [parseFloat(e.target.value), prev[1]])
          }
        />
        <Badge
          sx={{
            bg: 'primary',
            color: 'background',
            display: 'inline-block',
            position: 'relative',
            left: [3],
            top: [1],
          }}
        >
          {clim[0].toFixed(1)}
        </Badge>

        <Box sx={sx.label}>Maximum</Box>
        <Slider
          min={CLIM_RANGES[variable].min}
          max={CLIM_RANGES[variable].max}
          step={(variable == 'precip') ? 1.0 : 0.01}
          sx={{ width: '175px', display: 'inline-block' }}
          value={clim[1]}
          onChange={(e) =>
            setClim((prev) => [prev[0], parseFloat(e.target.value)])
          }
        />
        <Badge
          sx={{
            bg: 'primary',
            color: 'background',
            display: 'inline-block',
            position: 'relative',
            left: [3],
            top: [1],
          }}
        >
          {clim[1].toFixed(1)}
        </Badge>

      </Box>
    </>
  )
}

export default ParameterControls
