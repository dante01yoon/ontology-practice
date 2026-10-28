# 온톨로지, 정말 좋을까 — 실습 저장소

같은 과제(따릉이 요금 모듈 `fare.js`)를 조건만 바꿔 클로드 코드에 던지고, AI가 못 보는 숨은 테스트로 채점한다.

| 폴더·파일 | 하는 일 |
|---|---|
| `knowledge/source.md` | 따릉이 이용권 안내 원본 정리(bikeseoul.com, 2026-10-28) |
| `knowledge/ontology.md` · `PRD.md` · `SDD.md` | 영상에서 클로드 코드로 만든 지식 파일 |
| `starter/` | 모든 조건의 시작 폴더(빈 프로젝트) |
| `check/` | 「검사」 조건에만 넣는 보이는 테스트 3개 |
| `oracle/` | 숨은 채점 테스트 28개(실험 중 AI는 못 봄) |
| `reference/fare.js` | 채점 테스트가 맞는지 확인하는 정답 구현 |
| `run.mjs` | 조건별 실행 → `runs/results.jsonl` |
| `make-drift.mjs` | ontology.md만 옛 가격으로 둔 사본(어긋남 조건) |
| `report.mjs` | 조건별 평균표 |

## 조건
과제만 · +온톨로지 · +PRD·SDD · +둘 다 · +둘 다(한쪽만 옛 값) · +PRD·SDD+검사

## 실행
```bash
node make-drift.mjs
node run.mjs --reps 3
node report.mjs
```
`claude` CLI 로그인이 필요하다. 실행마다 비용이 든다.
