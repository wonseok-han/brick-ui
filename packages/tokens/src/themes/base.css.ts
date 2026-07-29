import { createGlobalTheme } from "@vanilla-extract/css";

import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  shadow,
  space,
} from "../primitives/scale";
import { baseVars } from "../contract.css";

createGlobalTheme(":root", baseVars, {
  space,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
  fontFamily,
  shadow,
});
