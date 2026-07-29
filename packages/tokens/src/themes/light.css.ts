import { createGlobalTheme } from "@vanilla-extract/css";

import { colorVars } from "../contract.css";
import { lightColors } from "./values";

/** 라이트가 기본값이다. `data-theme` 속성이 없어도 동작한다. */
createGlobalTheme(":root", colorVars, { color: lightColors });
