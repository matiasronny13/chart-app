/* eslint-disable no-empty-pattern */
import styled from "@emotion/styled";
import { Tab, Tabs } from "@mui/material";

export const StyledTabs = styled(Tabs)(({}) => ({
    minHeight: 30, // Adjust the height as needed
  }));
  
  export const StyledTab = styled(Tab)(({}) => ({
    minHeight: 30, // Adjust the height as needed
    minWidth: 30, // Adjust the width as needed
    padding: 10,
    textTransform: 'none'
  }));