import { TKeyValueSymbolMetadata } from "../shared/types";
import { defaultParam, timeframeOptions, websocketSymbolMapping } from "./topstep";

const hookConfig = {
    defaultParam,
    websocketSymbolMapping,
    timeframeOptions,
    symbolMetadata: {} as TKeyValueSymbolMetadata
};

export default hookConfig;