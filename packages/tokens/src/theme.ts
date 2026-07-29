/**
 * 테마 CSS 를 실제로 만들어내는 엔트리. 부수 효과 전용이라 export 가 없다.
 *
 * `index.ts` 와 분리한 이유가 중요하다. `index.ts` 가 이 파일을 import 하면,
 * `@brick/core` 가 `.css.ts` 안에서 `vars` 를 참조하는 순간 토큰 테마 CSS 가
 * core 의 스타일 번들에도 딸려 들어가 중복 출력된다.
 * 이름(계약)과 값(테마)의 진입점은 끝까지 분리한다.
 */
import "./themes/base.css";
import "./themes/light.css";
import "./themes/dark.css";
