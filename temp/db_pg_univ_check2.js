const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'haifeng', user:'postgres', password:'haifengweilaiguihuayuan' });
(async () => {
  await c.connect();
  console.log('=== t_postgrad_major 全量 ===');
  const pm = await c.query('SELECT id, major_code, major_name, status FROM t_postgrad_major ORDER BY id LIMIT 20');
  pm.rows.forEach(r => console.log(' ', JSON.stringify(r)));
  console.log('t_postgrad_major 行数:', pm.rows.length);
  console.log('=== t_university 前 10 条 ===');
  const uni = await c.query('SELECT id, name, status FROM t_university ORDER BY id LIMIT 10');
  uni.rows.forEach(r => console.log(' ', JSON.stringify(r)));
  console.log('=== ID 长度（雪花ID判断）===');
  const len = await c.query('SELECT id::text AS t, length(id::text) AS l FROM t_postgrad_major LIMIT 10');
  len.rows.forEach(r => console.log('  id =', r.t, ' 长度 =', r.l, ' 超JS安全整数(9007199254740991)?', BigInt(r.t) > 9007199254740991n));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
