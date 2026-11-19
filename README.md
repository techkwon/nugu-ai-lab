# 누구나쉽게 실험 노트 (lab-hub)

유튜브 시리즈 〈누구나쉽게〉의 AI 실험을 한곳에 모은 정적 사이트입니다. 빌드 과정은 없습니다.

| 파일 | 역할 |
|---|---|
| `index.html` | 페이지 뼈대. 맨 아래에 `data.json`의 예비 사본(파일로 열 때만 씀)이 들어 있습니다. |
| `style.css` | 디자인(밝은/어두운 화면, 휴대폰 폭 대응) |
| `app.js` | `data.json`을 읽어 목록·필터를 그림. 실패하거나 `file://`로 열면 예비 사본을 씀 |
| `data.json` | **모든 실험 항목과 실험 원칙.** 내용은 이 파일만 고치면 됩니다. |
| `sync_fallback.py` | `data.json`을 `index.html` 예비 사본에 복사(선택) |

## 실험 추가하는 법

1. `data.json`의 `entries` 배열에 항목 하나를 넣습니다(순서는 상관없음, 화면에서 편 번호 내림차순으로 정렬).
2. `updated`를 오늘 날짜로 바꿉니다.
3. (선택) `python3 sync_fallback.py` — 파일로 열었을 때도 새 항목이 보이게 합니다. 웹에 올린 사이트는 `data.json`을 직접 읽으므로 이 단계 없이도 반영됩니다.
4. 미리 보기: `python3 -m http.server 8000` 후 `http://localhost:8000/`.

진행 중이던 항목이 공개되면 `status`를 `"공개"`로, `episode`에 편 번호를, `youtube`·`site`·`takeaway`·`highlights`를 채웁니다.

## `entries` 항목 형식

```json
{
  "id": "ep16-webgl2-rematch",
  "episode": 16,
  "date": "2026-11-19",
  "status": "공개",
  "title": "유튜브 영상 제목 ([누구나쉽게] 머리말은 뺌)",
  "youtube": "https://youtu.be/...",
  "site": "https://techkwon.github.io/.../",
  "links": [{ "label": "저장소 (GitHub)", "url": "https://github.com/..." }],
  "type": "모델 대결",
  "models": [
    { "name": "Gemini 4 Hydrogen", "family": "Gemini" },
    { "name": "Gemini 4 Carbon", "family": "Gemini", "role": "영상 심사" }
  ],
  "takeaway": "정직한 한 줄 결론",
  "highlights": ["합계: A 47 · B 30", "비용: A $3.68(추정)"],
  "tags": ["원샷 대결", "블라인드 심사", "비용", "도구 사용"]
}
```

| 키 | 필수 | 설명 |
|---|---|---|
| `id` | 예 | 고유 문자열. 페이지 앵커(`#id`)로도 씀 |
| `episode` | 예 | 편 번호(숫자). 아직 번호가 없으면 `null` → "다음"으로 표시되고 맨 위에 옴 |
| `date` | 예 | `YYYY-MM-DD` |
| `status` | 예 | `"공개"` 또는 `"진행 중"`(배지로 표시) |
| `title` | 예 | 유튜브 제목 |
| `youtube` | 아니요 | 영상 주소. 없으면 `null` |
| `site` | 아니요 | 결과 사이트 주소. 없으면 `null` |
| `links` | 아니요 | 그 밖의 링크 `{label, url}` 배열 |
| `type` | 예 | `"모델 대결"` 또는 `"도구·사용법"` (필터와 정확히 같은 글자) |
| `models[].name` | 예 | 정확한 모델 이름 |
| `models[].family` | 예 | `"GPT"`, `"Claude"`, `"Gemini"`, `"기타"` 중 하나(필터·색 점에 씀) |
| `models[].role` | 아니요 | 선수가 아닌 역할(예: `"영상 심사"`) |
| `takeaway` | 예 | 한 줄 결론. 결과가 불리해도 그대로 씀 |
| `highlights` | 아니요 | 숫자 요약 몇 줄. **결과 사이트·원본 데이터에 있는 숫자만**, 추정치는 "(추정)" 표시 |
| `tags` | 아니요 | 짧은 태그 |

링크는 `https://`로 시작해야 표시됩니다.

## `principles`

`{ "title": "...", "body": "..." }` 배열입니다. 마지막 항목이 강조색으로 표시됩니다.

## 지켜야 할 것

- 이메일·개인 정보·로컬 컴퓨터 경로를 넣지 않습니다.
- 숫자를 지어내지 않습니다. 출처에서 확인되지 않으면 빼고 `takeaway`를 말로만 씁니다.
