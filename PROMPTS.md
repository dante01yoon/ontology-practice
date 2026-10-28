# 영상에서 쓴 프롬프트

## 1. 온톨로지 만들기 (클로드 코드)
```
knowledge/source.md를 읽고 따릉이 요금 온톨로지를 knowledge/ontology.md에 만들어 줘. 개념, 속성, 관계, 규칙으로 나눠 줘.
```

## 2. 같은 내용으로 PRD·SDD 만들기 (클로드 코드)
```
같은 내용으로 knowledge/PRD.md랑 knowledge/SDD.md도 써 줘. SDD에는 Key Entities 칸을 넣어 줘.
```

## 3. 실험 과제 (run.mjs가 모든 조건에 똑같이 던짐 — PROMPT.txt)
```
따릉이 요금 계산 모듈 fare.js 만들어 줘. 함수 세 개: price(이용권ID), extraFee(이용권ID, 분), canBuy(이용권ID, 회원여부). 이용권ID는 "일일권-1시간", "30일권-2시간" 같은 모양이야.
```
