import React from "react";
import { Box } from 'theme-ui'

const Suggestion = ({
  place,
  clickHandler,
  cursorIdx,
  idx,
  selectColor,
  mouseInSuggestions,
  isTouch
}) => {
  return (
    <Box
      sx = {{
        fontSize: '14px',
        padding: '1rem 1.5rem 1rem 1.5rem',
        cursor: 'pointer',
        width: '100%',
        // &:hover {
        //   color: white;
        //   background-color: ${props => props.selectColor};
        // }
      }}
      selectColor={selectColor}
      style={
        cursorIdx === idx && !mouseInSuggestions && !isTouch
          ? { color: "white", background: selectColor }
          : null
      }
      onMouseDown={event => clickHandler({ location: place, event })}
    >
      {place.place_name}
    </Box>
  );
};

export default Suggestion;