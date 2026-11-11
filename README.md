# flikk 회사 홈페이지

도메인: https://flikk.cc · 연락: hello@flikk.cc

빌드 없는 정적 사이트(HTML/CSS/JS, 외부 라이브러리 없음)입니다. 브랜드 기준은 `../CIBI/brand-kit-v2`를 따릅니다.

## 로컬 실행

```bash
python3 -m http.server 4173 --directory website
```

http://localhost:4173 에서 확인할 수 있습니다.

## 파일 구성

- `index.html` — 페이지 구조와 문구
- `styles.css` — 브랜드 토큰, 레이아웃, CSS 모션
- `main.js` — 스크롤·포인터 연동 모션(가로 스크롤 고정, 경로 따라가는 별, 마퀴, 클릭 버스트 등)
- `assets/` — 브랜드 키트에서 복사한 로고·파비콘·폰트
- `tools/og/build_og.py` — 공유 미리보기 이미지(`assets/og-image.png`, 1200×630)를 생성합니다. 로컬 서버를 켠 뒤 실행하세요.
- `tools/fonts/build_fonts.py` — `tools/fonts/src`의 원본 폰트를 woff2 서브셋으로 만들어 `assets/fonts/`에 저장합니다. 흔치 않은 한글 글자를 새로 쓰면 다시 실행하세요(`pip install fonttools brotli` 필요).
- `tools/inject_logo.py` — 브랜드 키트 SVG를 글자 단위로 나눠 `index.html`에 인라인합니다. 로고가 바뀌면 다시 실행하세요.

## 교체가 필요한 임시 콘텐츠

- 회사 소개 문구, 수치(설립 연도, 타이틀 수 등)
- 게임 타이틀: Lumi Fields / Blockward / Mosslight (브랜드 시안의 가칭)
- SNS 링크(`#`). 채용 버튼은 현재 hello@flikk.cc 메일로 연결
- studio 섹션의 Inbound Agency OS 화면은 실제 제품 화면이 아닌 CSS 목업

## 참고

- 폰트는 woff2 서브셋(합계 약 430KB)으로 제공합니다. 한글은 KS X 1001 상용 2,350자와 사이트에 쓰인 글자를 포함합니다.
- `sitemap.xml`의 `lastmod`는 큰 변경이 있을 때 갱신하세요.
- `prefers-reduced-motion` 사용자에게는 모션이 자동으로 꺼집니다.
