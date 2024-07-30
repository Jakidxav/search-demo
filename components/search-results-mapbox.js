import { useEffect, useState } from 'react'
import { Box, Text, useThemeUI } from 'theme-ui'
import { useMapbox } from '@carbonplan/maps'

const SearchResultsMapbox = ({
    results,
    setResults,
    setSearchText,
    setCoordinates,
    setBbox,
}) => {

    const { theme } = useThemeUI()

    const [place, setPlace] = useState(null)

    const sx = {
        'search-results': {
            color: 'primary',
            border: '1px solid',
            borderColor: 'primary',
            borderRadius: '5px',
            bg: theme.colors.background,
            transition: 'border 0.15s',
            fontSize: [3, 3, 3, 4],
            fontFamily: 'body',
            letterSpacing: 'body',
            lineHeight: [1.0],
            // width: '100%',
            width: ['300px'],
            p: ['5px'],
            ':focus': {
                borderColor: 'primary',
            },
            ':focus-visible': {
                outline: 'none !important',
                background: 'none !important',
            },
            '&:hover': {
                backgroundColor: "#ef4836",
                borderColor: 'primary',
            },
        },
    }

    const { map } = useMapbox()

    const handleResultClick = ((event, index) => {
        let selected = results[index]
        let place = event.target.innerText
        setSearchText(place)
        setPlace(place)
        setResults([])

        let featureType = selected.properties.feature_type
        if (featureType == 'place' || featureType == 'address') {
            setCoordinates(selected.geometry.coordinates)
        } else {
            console.log(selected.properties.bbox)
            setBbox(selected.properties.bbox)
        }
    })

    useEffect(() => {
        results.forEach(result => {
            console.log(result.properties.full_address, result.properties.feature_type)
        })
        console.log()
    }, [results])

    return (
        <Box>
            {results.length == 0 ?
                <Box></Box>
                :
                results.map((result, index) => {
                    return (
                        <Box key={index} sx={sx['search-results']} >
                            <Box onClick={event => handleResultClick(event, index)}>
                                <Text>{result.properties.full_address}</Text>
                            </Box>
                            <Box>
                                <Text sx={{
                                    fontStyle: 'italic',
                                    fontSize: [2, 2, 2, 3],

                                }}>
                                    {result.properties.feature_type}
                                </Text>
                            </Box>
                        </Box>
                    )
                })
            }
        </Box>
    )
}

export default SearchResultsMapbox