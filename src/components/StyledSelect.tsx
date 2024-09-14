/* eslint-disable no-empty-pattern */
import styled from "@emotion/styled";
import { Select } from "@mui/material";

export const StyledSelect = styled(Select)(({}) => ({
    marginRight: 20
    //paddingLeft: theme.spacing(0.5),
    
    // '& .MuiInputBase-root': {
    //     height: 30, // Adjust the height as needed
    //     fontSize: '0.875rem', // Adjust the font size if needed
    // },
    // '& .MuiSelect-select': {
    //     padding: '6px 14px', // Adjust the padding as needed
    // },
}));