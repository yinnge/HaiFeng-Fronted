import os

base = r'D:\0code\haifeng\fronted\HaiFeng-Fronted\apps\admin\src\views'

FF = '\ufffd'
QM = '?'

fixes = {}

# 1) algorithm/admission/group - fix batch options and template string
fixes[os.path.join(base, 'algorithm/admission/group/index.vue')] = [
    ("const batchOptions = ['本科" + FF + QM + "', '提前, '专科]",
     "const batchOptions = ['本科', '提前', '专科']"),
    ("return `${requirementType}" + FF + QM + "{subjects.join('" + FF + QM + ")}`",
     "return `${requirementType}:${subjects.join('、')}`"),
]

# 2) certificate/certificate - fix el-option labels/values
cert_fixes = {}
for word in ['财会', '语言', '工程']:
    cert_fixes['label="' + word + FF + QM + ' value="' + word + FF + QM + ' />'] = \
        'label="' + word + '" value="' + word + '" />'
cert_fixes['placeholder="' + FF + QM + ' />'] = 'placeholder="元" />'
fixes[os.path.join(base, 'certificate/certificate/index.vue')] = list(cert_fixes.items())

# 3) certificate/competition - fix el-option labels/values and template
comp_fixes = {}
comp_fixes['label="国家' + FF + QM + ' value="国家' + FF + QM + ' />'] = \
    'label="国家级" value="国家级" />'
comp_fixes['}}' + FF + QM + '/strong>{{'] = '}}</strong>{{'
fixes[os.path.join(base, 'certificate/competition/index.vue')] = list(comp_fixes.items())

# 4) employment/community - fix contract type and district labels
comm_fixes = [
    ("'合同" + FF + QM + ", '政府购买服务'", "'合同制', '政府购买服务'"),
    ("label=\"" + FF + QM + FF + QM + "\"", 'label="所属区域"'),
    ('placeholder="' + FF + QM + FF + QM + '"', 'placeholder="请输入所属区域"'),
]
fixes[os.path.join(base, 'employment/community/index.vue')] = comm_fixes

# 5) employment/healthcare - fix contract type and district labels
health_fixes = [
    ("'合同" + FF + QM + ", '人事代理'", "'合同制', '人事代理'"),
    ("label=\"" + FF + QM + FF + QM + "\"", 'label="所属区域"'),
    ('placeholder="' + FF + QM + FF + QM + '"', 'placeholder="请输入所属区域"'),
]
fixes[os.path.join(base, 'employment/healthcare/index.vue')] = health_fixes

for path, file_fixes in fixes.items():
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    for old, new in file_fixes:
        if old in content:
            content = content.replace(old, new)
            rel = os.path.relpath(path, base)
            # print silently - skip console output with special chars
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    else:
        print(f'{os.path.relpath(path, base)}: NO MATCHES FOUND')

# Verify remaining
print('\n--- Remaining U+FFFD ---')
for fpath, _ in fixes.items():
    with open(fpath, 'r', encoding='utf-8') as f:
        c = f.read()
    count = c.count(FF)
    if count > 0:
        print(f'{os.path.relpath(fpath, base)}: {count} remaining')
    else:
        print(f'{os.path.relpath(fpath, base)}: CLEAN')