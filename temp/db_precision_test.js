const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'haifeng', user:'postgres', password:'haifengweilaiguihuayuan' });
(async () => {
  await c.connect();
  // 1. 模拟 JS Number 精度丢失
  const realId = '2083478412894277632';
  const jsNumber = Number(realId);
  console.log('库中真实 id   :', realId);
  console.log('JS Number 解析后:', JSON.stringify(jsNumber));
  console.log('是否精度丢失    :', String(jsNumber) !== realId);
  // 2. 用丢失后的 id 去 selectById，复现后端逻辑
  const lostId = String(jsNumber);
  const r = await c.query('SELECT id, major_name, status FROM t_postgrad_major WHERE id = $1', [lostId]);
  console.log('后端 selectById(丢失后 id) 结果行数:', r.rows.length);
  // 3. 查大学真实表名和 id
  const tables = await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND (tablename LIKE '%university%' OR tablename LIKE '%postgrad%') ORDER BY tablename");
  console.log('相关表:', tables.rows.map(x=>x.tablename).join(', '));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
