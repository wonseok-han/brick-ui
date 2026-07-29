import { createGlobalTheme } from "@vanilla-extract/css";

import { colorVars } from "../contract.css";
import { darkColors } from "./values";

/**
 * `<html data-theme="dark">` 로 전환한다.
 *
 * `prefers-color-scheme` 미디어 쿼리를 쓰지 않는 이유는, 사용자가 앱 안에서
 * 테마를 직접 고르는 경우를 막지 않기 위해서다. OS 설정 연동이 필요하면
 * 소비 측에서 속성을 세팅하면 된다.
 */
createGlobalTheme('[data-theme="dark"]', colorVars, { color: darkColors });
