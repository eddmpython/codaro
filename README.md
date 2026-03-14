# Codaro

Codaro is a programmable notebook editor with two surfaces:

- `Edit` for writing and running code/markdown blocks
- `App` for hiding code and presenting the same document as a lightweight runtime

## Commands

```bash
uv run codaro edit path.py
uv run codaro run path.py
uv run codaro export path.py --format marimo
```

## Frontend

The frontend lives in `frontend/` and builds into `src/codaro/webBuild/`.

```bash
cd frontend
npm install
npm run build
```

If the build output is missing, the Python server will try to build it automatically.
