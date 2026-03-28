"""
Extracts cognee's declared dependencies from its wheel metadata,
excluding fastapi-users (which has an internal python-multipart conflict).
"""
import zipfile
import glob

whl = glob.glob('/tmp/cognee_dl/cognee*.whl')[0]
deps = []

with zipfile.ZipFile(whl) as z:
    for name in z.namelist():
        if name.endswith('/METADATA') or name == 'METADATA':
            content = z.read(name).decode('utf-8', errors='ignore')
            for line in content.splitlines():
                if line.startswith('Requires-Dist:'):
                    req = line.split('Requires-Dist:')[1].strip()
                    skip = ('fastapi-users' in req.lower() or 'fastapi_users' in req.lower())
                    if not skip:
                        deps.append(req)
            break

with open('/tmp/cognee_runtime_deps.txt', 'w') as f:
    f.write('\n'.join(deps))

print(f'Extracted {len(deps)} cognee runtime deps (fastapi-users excluded)')
