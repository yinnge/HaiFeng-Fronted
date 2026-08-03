-- ============================================================
-- 清理专业表 major_category 脏数据（值为字面字符串 'null'）
-- 适用：PostgreSQL（海枫后端）
-- 背景：前端专业类别下拉出现 "null" 选项，根因是 DB 里
--       major_category 字段存了字面文本 'null'（导入时空值写成字符串）。
-- ⚠️ 执行前务必先跑 第0、1 步确认表名与范围，再将 <major_table> 替换。
-- ============================================================

-- 0) 确认专业主表真实表名（看哪个有数据，通常 t_major / major / major_info）
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%major%';

-- 1) 查看脏数据范围（把 <major_table> 换成第 0 步查到的表名）
SELECT major_category, COUNT(*) AS cnt
FROM <major_table>
WHERE major_category IS NULL
   OR major_category = 'null'
GROUP BY major_category;

-- 2) 修正：把字面字符串 'null' 置为真正的 NULL
--    说明：前端 fetchStats 已过滤 null/'null'，category-stats 即便返回 null 组也会被剔除，
--    下拉不再显示 "null"。若表有 NOT NULL 约束则跳过本步，改用 2-b 手动补齐真实类别。
UPDATE <major_table>
SET major_category = NULL
WHERE major_category = 'null';

-- 2-b) 可选：若确认这些记录本应有真实类别，手动补齐，例如：
-- UPDATE <major_table> SET major_category = '工学' WHERE id = '<真实id>';

-- 3) 复核：应返回 0（无 'null' 字符串残留）
SELECT COUNT(*) FROM <major_table> WHERE major_category = 'null';

-- 4) 若后端 category-stats 接口加了 Redis 缓存，清完数据后需清缓存或等 TTL 失效，
--    否则下拉可能仍读到旧快照。可让后端重启对应服务或清 key（如 major:category-stats）。
