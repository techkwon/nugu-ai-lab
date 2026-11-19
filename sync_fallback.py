#!/usr/bin/env python3
"""data.json 내용을 index.html 안의 예비 사본(파일로 열 때 쓰는 것)에 복사한다."""
import json
import pathlib
import re

here = pathlib.Path(__file__).resolve().parent
data = json.loads((here / "data.json").read_text(encoding="utf-8"))
blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
html_path = here / "index.html"
html = html_path.read_text(encoding="utf-8")
pattern = re.compile(r'(<script type="application/json" id="fallback-data">).*?(</script>)', re.S)
new, n = pattern.subn(lambda m: m.group(1) + blob + m.group(2), html)
if n != 1:
    raise SystemExit("fallback-data 블록을 찾지 못했습니다")
html_path.write_text(new, encoding="utf-8")
print(f"예비 사본 갱신: 항목 {len(data['entries'])}개")
