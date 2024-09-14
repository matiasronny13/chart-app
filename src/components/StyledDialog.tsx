/* eslint-disable no-empty-pattern */
import styled from "@emotion/styled";
import { Dialog } from "@mui/material";

export const StyledDialog = styled(Dialog)(({}) => ({
    '& .MuiPaper-root': {
        position: 'absolute',
        borderRadius: '10px',
        top: 100
    },
}));