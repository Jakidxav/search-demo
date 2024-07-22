// Adapted from Carbonplan's <Input /> component:
// https://github.com/carbonplan/components/blob/main/src/input.js

import React, { forwardRef, useState } from 'react'
import { Box, Input, Select, Text, useThemeUI } from 'theme-ui'
import { Badge, Button} from '@carbonplan/components'
// import { searchArray } from './search-array'
import { searchArray } from './places'
// import { searchArray } from './places_old'
import SearchResults from './search-results'

const SearchBox = () => {
  const { theme } = useThemeUI()

  const [results, setResults] = useState([])
  const [searchText, setSearchText] = useState(null)
  const [lookup, setLookup] = useState(null)
  const [coordinates, setCoordinates] = useState(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [searchBy, setSearchBy] = useState('place') // 'place' or 'coords'
  const [validLatitude, setValidLatitude] = useState(true)
  const [validLongitude, setValidLongitude] = useState(true)

  const sx = {
    'search-by-place': {
      color: 'primary',
      bg: theme.colors.background,
      border: '2px solid',
      borderColor: 'secondary',
      transition: 'border 0.15s',
      fontSize: [3, 3, 3, 4],
      fontFamily: 'body',
      letterSpacing: 'body',
      lineHeight: [1.0],
      width: '100%',
      p: '5px',
      mt: [1],
      'input::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      'input::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      ':focus': {
        borderColor: 'primary',
        bg: theme.colors.primary,

      },
      ':focus-visible': {
        outline: 'none !important',
        bg: theme.colors.primary,
      },
    },
    'search-by-latlon-container': {
      ':has(#lon-input:focus)': {
        '#lon-badge': {
          borderColor: 'primary'
        }
      },
      ':has(#lat-input:focus)': {
        '#lat-badge': {
          borderColor: 'primary'
        }
      },
    },
    'search-by-latlon': {
      color: 'primary',
      bg: theme.colors.background,
      border: '2px solid',
      borderLeft: '0px',
      borderColor: 'secondary',
      borderRadius: '0px 5px 5px 0px',
      transition: 'border 0.15s',
      fontSize: [3, 3, 3, 4],
      fontFamily: 'body',
      letterSpacing: 'body',
      lineHeight: [1],
      height: '2rem',
      width: '80%',
      display: 'inline-block',
      p: '5px 5px 5px 5px',
      mt: [1],
      'input::-webkit-outer-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      'input::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
      },
      ':focus': {
        borderColor: 'primary',
        bg: theme.colors.primary,
      },
      ':focus-visible': {
        outline: 'none !important',
        bg: theme.colors.primary,
      },
    },
    'toggle-search': {
      color: 'primary',
      bg: theme.colors.background,
      mb: [4],
      width: ['150px'],
    },
    'latlon-badge': {
      color: 'primary',
      bg: theme.colors.background,
      border: '2px solid',
      borderRight: '0px',
      borderColor: 'secondary',
      borderRadius: '5px 0px 0px 5px',
      transition: 'border 0.15s',
      fontSize: [3, 3, 3, 4],
      fontFamily: 'body',
      letterSpacing: 'body',
      lineHeight: [1.0],
      height: '2rem',
      width: '20%',
      pb: '5px',
      pt: '4px',
    },
    'latlon-button': {
      color: 'secondary',
      bg: theme.colors.background,
      border: '2px solid',
      borderColor: 'secondary',
      borderRadius: '5px',
      transition: 'border 0.15s',
      fontSize: [3, 3, 3, 4],
      fontFamily: 'body',
      letterSpacing: 'body',
      lineHeight: [1.0],
      width: '25%',
      height: ['24px', '24px', '24px', '26px'],
      textAlign: 'center',
      pt: ['6px'],
      pb: ['26px'],
      mt: [1],
      float: 'right',
        '&:hover': {
          color: 'primary',
          borderColor: 'primary',
        },
    },
    'warning-box': {
      border: '2px solid',
      borderColor: 'red',
      my: [1], 
      p: [1], 
      bg: theme.colors.background,
    }
  }

  const handleSearch = (event) => {
    const limit = 5;
    let query = event.target.value
    // console.log(query)
    setSearchText(query)

    if (query == "") {
      setResults([])
      return
    }

    let tempResults = searchArray.filter((place) => {
      return place[0]["name"].startsWith(query)
      // return place[0]["name"] place[0]["name"].startsWith(query)
      // return place.startsWith(query)
    }).slice(0, limit)

    let numResults = tempResults.length
    if (numResults < limit) {
      let additionalResults = searchArray.filter((place) => {
        return !place[0]["name"].startsWith(query) && place[0]["name"].toLowerCase().includes(query.toLowerCase())
      }).slice(0, limit - numResults)

      tempResults = tempResults.concat(additionalResults)
    }
    // console.log(tempResults.map((place) => [place[0]["name"], place[0]["search"]]))
    setResults(tempResults.map((place) => [place[0]["name"], place[0]["search"]]))
    // console.log(tempResults)
    // setResults(tempResults)
  }

  const handleLatSearch = (event) => {
    setLatitude(event.target.value)
  }

  const handleLonSearch = (event) => {
    setLongitude(event.target.value)
  }

  return (
    <>
      <Box sx={{ width: '300px' }}>
        <Select
          size='xs'
          sx={{ width: '50%' }}
          value={searchBy}
          onChange={(event) => setSearchBy(event.target.value)}
        >
          <option value='place'>Place</option>
          <option value='coords'>Coordinates</option>
        </Select>

        {searchBy == 'place' && (
          <>
            <Input
              placeholder='Search for place'
              sx={sx['search-by-place']}
              onChange={handleSearch}
              value={searchText}
            />

            <SearchResults
              results={results}
              setResults={setResults}
              searchText={searchText}
              setSearchText={setSearchText}
              lookup={lookup}
              setLookup={setLookup}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
            />
          </>
        )}

        {searchBy == 'coords' && (
          <Box sx={sx['search-by-latlon-container']}>
            <Badge id={'lat-badge'} sx={sx['latlon-badge']}>
              {'Lat: '}
            </Badge>
            <Input
              id={'lat-input'}
              placeholder='[-90, 90]'
              sx={sx['search-by-latlon']}
              onChange={handleLatSearch}
              value={latitude}
            />
            {!validLatitude && (
              <Box sx={sx['warning-box']}>
                <Text sx={{color: 'red'}}>Please enter a numeric value between [-90, 90].</Text>
              </Box>
            )}

            <Badge id={'lon-badge'} sx={{...sx['latlon-badge'], ...sx['lon-badge']}}>
              {'Lon: '}
            </Badge>
            <Input
              id={'lon-input'}
              placeholder='[-180, 180]'
              sx={sx['search-by-latlon']}
              onChange={handleLonSearch}
              value={longitude}
            />

            {!validLongitude && (
              <Box sx={sx['warning-box']}>
                <Text sx={{color: 'red'}}>Please enter a numeric value between [-180, 180].</Text>
              </Box>
            )}

            <Button sx={sx['latlon-button']}>Search</Button>
          </Box>
        )}
      </Box>
    </>
  )
}

export default forwardRef(SearchBox)