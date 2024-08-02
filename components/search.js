// Adapted from Carbonplan's <Input /> component:
// https://github.com/carbonplan/components/blob/main/src/input.js
import React, { forwardRef, useEffect, useState } from 'react'
import { Box, Select, useThemeUI } from 'theme-ui'
import { useMapbox } from '@carbonplan/maps'
import { searchArray } from './places'
import SearchBox from './search-box'
import SearchBoxCoords from './search-box-coords'
import SearchResults from './search-results'
import SearchResultsMapbox from './search-results-mapbox'

const Search = () => {
  const { theme } = useThemeUI()

  const [results, setResults] = useState([])
  const [searchText, setSearchText] = useState(null)
  const [resultsMapbox, setResultsMapbox] = useState([])
  const [searchTextMapbox, setSearchTextMapbox] = useState(null)
  const [coordinates, setCoordinates] = useState(null)
  const [bbox, setBbox] = useState(null)
  const [searchBy, setSearchBy] = useState('place') // 'place', 'coords', 'mapbox'

  const MAPBOX_TOKEN = ''

  const { map } = useMapbox()

  const sx = {
    'toggle-search': {
      color: 'primary',
      bg: theme.colors.background,
      mb: [4],
      width: ['150px'],
    }
  }

  const handleSearch = (event) => {
    const limit = 5;
    let query = event.target.value
    setSearchText(query)

    if (query == "") {
      setResults([])
      return
    }

    let tempResults = searchArray.filter((place) => {
      return place[0]["name"].startsWith(query)
    }).slice(0, limit)

    let numResults = tempResults.length
    if (numResults < limit) {
      let additionalResults = searchArray.filter((place) => {
        return !place[0]["name"].startsWith(query) && place[0]["name"].toLowerCase().includes(query.toLowerCase())
      }).slice(0, limit - numResults)

      tempResults = tempResults.concat(additionalResults)
    }
    setResults(tempResults.map((place) => [place[0]["name"], place[0]["search"]]))
  }

  const handleSearchMapbox = (event) => {
    const limit = 5;
    let query = event.target.value
    setSearchTextMapbox(query)

    if (query == "") {
      setResultsMapbox([])
      return
    }

    fetch(`https://api.mapbox.com/search/geocode/v6/forward?q=${query}&access_token=${MAPBOX_TOKEN}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.features.length == 0) {
          console.log("Empty results")
        } else {
          setResultsMapbox(json.features)
        }
      })
  }

  const handleSearchBy = (event) => {
    if (event.target.value == 'mapbox') {
      setSearchText("")
      setCoordinates(null)
    } else if (event.target.value == 'place') {
      setSearchTextMapbox("")
      setCoordinates(null)
    } else {
      setSearchText("")
      setSearchTextMapbox("")
    }
    setSearchBy(event.target.value)
  }

  useEffect(() => {
    if (coordinates) {
      map.flyTo({
        center: coordinates,
        zoom: 7.5,
      })
    }
  }, [coordinates])

  useEffect(() => {
    if (bbox) {
      map.fitBounds(bbox)
      // console.log('Zoom:', map.getZoom())
    }
  }, [bbox])

  return (
    <>
      <Box sx={{ width: '300px' }}>
        <Select
          size='xs'
          sx={{ width: '50%' }}
          value={searchBy}
          onChange={handleSearchBy}
        >
          <option value='place'>Place</option>
          <option value='coords'>Coordinates</option>
          <option value='mapbox'>Mapbox</option>
          {/* <option value='pelias'>Pelias</option> */}
        </Select>

        {searchBy == 'place' && (
          <>
            <SearchBox
              placeholder={'Search for place'}
              onSearch={handleSearch}
              text={searchText}
            />

            <SearchResults
              results={results}
              setResults={setResults}
              searchText={searchText}
              setSearchText={setSearchText}
              setCoordinates={setCoordinates}
              setBbox={setBbox}
            />
          </>
        )}

        {searchBy == 'mapbox' && (
          <>
            <SearchBox
              placeholder='Search for place'
              onSearch={handleSearchMapbox}
              text={searchTextMapbox}
            />

            <SearchResultsMapbox
              results={resultsMapbox}
              setResults={setResultsMapbox}
              setSearchText={setSearchTextMapbox}
              setCoordinates={setCoordinates}
              setBbox={setBbox}
            />
          </>
        )}

        {searchBy == 'coords' && (
          <SearchBoxCoords setCoordinates={setCoordinates} />
        )}
      </Box>
    </>
  )
}

export default forwardRef(Search)