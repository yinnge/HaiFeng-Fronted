import os, sys

base = r'D:\0code\haifeng\fronted\HaiFeng-Fronted\apps\admin\src\views'

FF = '\ufffd'
QM = '?'

files = [
    'employment/civil/index.vue',
    'employment/content/guide/index.vue',
    'employment/content/notice/index.vue',
    'employment/finance/index.vue',
    'employment/grassroots/index.vue',
    'employment/healthcare/index.vue',
    'employment/institution/index.vue',
    'employment/military/index.vue',
    'employment/selection/index.vue',
    'employment/teacher/index.vue',
    'employment/welfare/index.vue',
]

# Load all files
contents = {}
for f in files:
    path = os.path.join(base, f)
    with open(path, 'r', encoding='utf-8') as fp:
        contents[f] = fp.read()

# Global replacements for ALL files
global_fixes = {
    # k/month salary
    "k/" + FF + QM: "k/月",
    
    # join with enumeration comma
    ".join('" + FF + QM + ")": ".join('、')",
    
    # 国家级/省级
    "'国" + FF + QM: "'国家级",
    "'省" + FF + QM: "'省级",
    
    # 合同制
    "'合同" + FF + QM: "'合同制",
    
    # 区域 labels (where 2 corrupted chars exist)
    "label=\"" + FF + QM + FF + QM + "\"": 'label="区域"',
    "label=\"" + FF + QM + FF + QM + " width": 'label="区域" width',
    "label=\"" + FF + QM + FF + QM + ">{{ detai": 'label="区域">{{ detai',
    "t\" label=\"" + FF + QM + FF + QM + " width": 't" label="区域" width',
    "y\" label=\"" + FF + QM + FF + QM + " width": 'y" label="区域" width',
    
    # 区域 placeholders
    "placeholder=\"" + FF + QM + FF + QM + " clearabl": 'placeholder="请输入区域" clearabl',
    "placeholder=\"" + FF + QM + FF + QM + " maxlengt": 'placeholder="请输入区域" maxlengt',
    "ceholder=\"" + FF + QM + FF + QM + " cleara": 'ceholder="请输入区域" cleara',
    "ceholder=\"" + FF + QM + FF + QM + " maxlen": 'ceholder="请输入区域" maxlen',
    
    # 区域 form-item labels
    "em label=\"" + FF + QM + FF + QM + ">\n": 'em label="区域">\n',
    "em label=\"" + FF + QM + FF + QM + ">{{ det": 'em label="区域">{{ det',
    "m label=\"" + FF + QM + FF + QM + " :span": 'm label="区域" :span',
    "on label=\"" + FF + QM + " :value": 'on label="区域" :value',
    "on label=\"" + FF + QM + FF + QM + " width": 'on label="区域" width',
    "on label=\"" + FF + QM + FF + QM + ">\n": 'on label="区域">\n',
    "on label=\"" + FF + QM + FF + QM + ">{{ det": 'on label="区域">{{ det',
    
    # 作品 label
    "m label=\"作" + FF + QM + " :span": 'm label="作品" :span',
    
    # 低保/残疾 labels
    "label=\"低保" + FF + QM + " value=\"低保" + FF + QM: 'label="低保" value="低保"',
    "label=\"残疾" + FF + QM + " value=\"残疾" + FF + QM: 'label="残疾" value="残疾"',
    "value=\"低保" + FF + QM: 'value="低保"',
    "value=\"残疾" + FF + QM: 'value="残疾"',
    
    # 热门/急招 options (remove corrupted item)
    "['热门', '" + FF + QM + "', '急招']": "['热门', '急招']",
    
    # v-else fallback text
    "v-else>" + FF + QM + "/span>": "v-else>无</span>",
    
    # 删除银行
    "rm('确定删除该银" + FF + QM + "金融岗位吗？',": "rm('确定删除该银行金融岗位吗？',",
    
    # 特岗教师
    "'合同" + FF + QM + ", '特岗教师'": "'合同制', '特岗教师'",
}

# List of ternary variable patterns to fix: valueName ? 'corrupted1' : 'corrupted2'
ternary_vars = [
    'Remote', 'oCivil', 'ftWork', 'tution', 'tyCert', 'alTest', 'ewable', 'tion'
]

for var in ternary_vars:
    pattern = var + " ? '" + FF + QM + "' : '" + FF + QM + "'"
    if var == 'Remote':
        replacement = var + " ? '远程' : '现场'"
    elif var == 'ftWork':
        replacement = var + " ? '全职' : '兼职'"
    else:
        replacement = var + " ? '是' : '否'"
    global_fixes[pattern] = replacement

# Short patterns (must be matched exactly with enough context)
global_fixes["ionTag = '" + FF + QM] = "ionTag = '是"
global_fixes["ionTag || '" + FF + QM] = "ionTag || '是"
global_fixes["tionTag: '" + FF + QM + ",\n"] = "tionTag: '是',\n"

changed_files = []
for fkey, content in contents.items():
    original = content
    for old, new in global_fixes.items():
        if old in content:
            content = content.replace(old, new)
    if content != original:
        contents[fkey] = content
        changed_files.append(fkey)

# Write changed files
for fkey in changed_files:
    path = os.path.join(base, fkey)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(contents[fkey])

# Report
total_remaining = 0
for fkey in files:
    c = contents.get(fkey, '')
    count = c.count(FF)
    total_remaining += count
    status = 'CLEAN' if count == 0 else f'{count} LEFT'
    print(f'{fkey}: {status}')

print(f'\nTotal remaining: {total_remaining}')