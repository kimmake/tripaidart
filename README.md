# Trip Dart

대한민국 시·군 지도에 다트를 던져 여행지를 고르는 웹페이지.

- `index.html` — 바로 열 수 있는 웹페이지 (정적 서버 필요: `fetch('regions.json')`)
- `quiz.html` — 성별·취향 질문 8개로 국내(22곳)·해외(41곳) 여행지를 추천하는 성향 검사. triponline과 같은 화면(d3 세계지도, 위키백과 사진)이며 다트 결과 카드의 "사용자 맞춤 여행지 찾기" 버튼으로 연결
- `regions.json` — 시·군 경계(지도 좌표로 변환된 SVG path), 이름표 위치, 도 경계
- `design/` — Claude Design 캔버스 원본(`Main.dc.html`, `canvas.json`). 캔버스 전용 형식이라 단독으로는 열리지 않음
- `scripts/build-regions.mjs` — `regions.json` 생성 스크립트

## 실행

```bash
python3 -m http.server 8000
```

## 지도 데이터

통계청 2013년 시군구 경계([southkorea/southkorea-maps](https://github.com/southkorea/southkorea-maps), `kostat/2013/json/skorea_municipalities_geo_simple.json`)를 사용.

- 광역시·특별시는 하나로, 구가 있는 일반시(수원·청주 등)는 시 단위로 합침
- 청원군 → 청주시 통합(2014), 군위군 → 대구광역시 편입(2023) 반영

재생성:

```bash
npm i topojson-server@3 topojson-client@3 d3-geo@3
curl -O https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo_simple.json
mv skorea_municipalities_geo_simple.json kr.json
node scripts/build-regions.mjs   # regions.json 생성
```
