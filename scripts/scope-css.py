# Prefixes every rule in a stylesheet with a scope class, so styles copied from the ops app only apply inside it.
# Usage: python3 scripts/scope-css.py .sbx in.css [in2.css ...] > out.css
import re, sys
scope, files = sys.argv[1], sys.argv[2:]
ROOTS = re.compile(r'^(:root|html|body)(?![\w-])')

def split_top(s, ch):
    out, depth, cur = [], 0, ''
    for c in s:
        if c in '([': depth += 1
        if c in ')]': depth -= 1
        if c == ch and depth == 0: out.append(cur); cur = ''
        else: cur += c
    out.append(cur); return out

def prefix(sel):
    res = []
    for s in split_top(sel, ','):
        s = s.strip()
        if not s: continue
        res.append(ROOTS.sub(scope, s) if ROOTS.match(s) else f'{scope} {s}')
    return ', '.join(res)

def walk(css):
    out, i, n = '', 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: out += css[i:]; break
        head = css[i:j]
        depth, k = 1, j + 1
        while depth and k < n:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        h = head.strip()
        if h.startswith('@'):
            name = h.split()[0]
            if name in ('@media', '@supports', '@container', '@layer'): out += f'{h} {{\n{walk(body)}}}\n'
            else: out += f'{h} {{{body}}}\n'
        else: out += f'{prefix(h)} {{{body}}}\n'
        i = k
    return out

for f in files:
    css = re.sub(r'/\*.*?\*/', '', open(f).read(), flags=re.S)
    print(f'/* ---- {f.split("/")[-1]} ---- */'); print(walk(css))
