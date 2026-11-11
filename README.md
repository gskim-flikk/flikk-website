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
- `tools/inject_logo.py` — 브랜드 키트 SVG를 글자 단위로 나눠 `index.html`에 인라인합니다. 로고가 바뀌면 다시 실행하세요.

## 교체가 필요한 임시 콘텐츠

- 회사 소개 문구, 수치(설립 연도, 타이틀 수 등)
- 게임 타이틀: Lumi Fields / Blockward / Mosslight (브랜드 시안의 가칭)
- SNS 링크(`#`). 채용 버튼은 현재 hello@flikk.cc 메일로 연결
- studio 섹션의 Inbound Agency OS 화면은 실제 제품 화면이 아닌 CSS 목업
- `og:image`(https://flikk.cc/assets/og-cover.png)는 studio 커버를 임시로 사용 중

## 배포 전 권장

- Pretendard OTF와 Nunito TTF를 woff2 서브셋으로 변환해 용량을 줄이세요(라이선스 파일은 함께 유지).
- `prefers-reduced-motion` 사용자에게는 모션이 자동으로 꺼집니다.
