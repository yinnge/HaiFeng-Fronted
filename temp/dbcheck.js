const { Client } = require('pg');
const c = new Client({
  host: 'localhost', port: 5432, database: 'haifeng',
  user: 'postgres', password: 'haifengweilaiguihuayuan'
});
(async () => {
  await c.connect();
  const total = await c.query('SELECT COUNT(*) AS n FROM t_major');
  console.log('总记录数:', total.rows[0].n);
  const byStatus = await c.query('SELECT status, COUNT(*) AS n FROM t_major GROUP BY status ORDER BY status');
  console.log('按 status 分布:', JSON.stringify(byStatus.rows));
  const cats = await c.query(`SELECT major_category, status, COUNT(*) AS n FROM t_major GROUP BY major_category, status ORDER BY major_category`);
  console.log('各 major_category 分布:');
  cats.rows.forEach(r => console.log('  ', JSON.stringify(r)));
  const gong = await c.query(`SELECT id, major_code, major_name, major_category, status FROM t_major WHERE major_category = '工学' OR major_name LIKE '%工学%' LIMIT 10`);
  console.log('工学相关记录:', JSON.stringify(gong.rows));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
