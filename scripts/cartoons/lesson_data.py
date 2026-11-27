"""Read Baan's own lesson lines straight from the repo (src/data/scenes.ts), so the reel never invents Thai."""
import json, re, os
REPO = os.environ.get("BAAN_REPO") or next(p for p in (os.path.join(os.path.dirname(os.path.abspath(__file__)), "../.."), "/workspace/social-content/baan-repo") if os.path.exists(os.path.join(p, "src/data/scenes.ts")))
def scenes():
    src = open(os.path.join(REPO, "src/data/scenes.ts"), encoding="utf-8").read()
    body = src[src.index("SCENES: Scene[] = ") + len("SCENES: Scene[] = "):]
    body = body[:body.rindex("];") + 1]
    return {s["id"]: s for s in json.loads(body)}
def line(scene_id, line_id, voice="male"):
    s = scenes()[scene_id]
    for l in s["lines"]:
        if l["id"] == line_id:
            pick = lambda v: v[voice] if isinstance(v, dict) else v
            return dict(scene=scene_id, id=line_id, who=l["who"], thai=pick(l["thai"]), roman=pick(l["roman"]), en=l["en"], note=l.get("note"))
    raise KeyError(f"{scene_id}/{line_id}")
if __name__ == "__main__":
    S = scenes(); print(len(S), "scenes")
    for sid in ("cafe", "order", "taxi", "market"):
        s = S[sid]; print(sid, s["titleTh"], s["title"], [l["id"] for l in s["lines"]])
