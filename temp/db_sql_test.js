const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'haifeng', user:'postgres', password:'haifengweilaiguihuayuan' });
(async () => {
  await c.connect();
  // 完全复刻 MajorMapper.countByCategory 的 SQL
  const r = await c.query(`SELECT major_category AS majorCategory, COUNT(*) AS count
    FROM t_major WHERE status = 1 AND major_category IS NOT NULL
    GROUP BY major_category ORDER BY COUNT(*) DESC`);
  console.log('返回行数:', r.rows.length);
  r.rows.forEach(row => {
    console.log('--- 一行 ---');
    console.log('  Object.keys(row) =', JSON.stringify(Object.keys(row)));   // PG 实际返回的 key
    console.log('  row.majorCategory =', JSON.stringify(row.majorCategory));  // 后端代码用的 key（驼峰）
    console.log('  row.majorcategory =', JSON.stringify(row.majorcategory));  // PG 实际小写 key
    console.log('  String.valueOf(majorCategory) =', JSON.stringify(String(row.majorCategory))); // 后端 String.valueOf 结果
  });
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
