/**
 * CSS 를 산출하기 위한 부수효과 전용 엔트리. export 가 없다.
 *
 * 컴포넌트의 recipe CSS 는 `index.ts` 쪽 그래프에서 딸려오지만, 리셋과
 * 스프링클은 아무도 import 하지 않으면 생성되지 않는다. 여기서 명시적으로 끌어온다.
 * 최종 산출물은 하나의 `dist/styles.css` 다.
 */
import "./styles/reset.css";
import "./styles/sprinkles.css";
