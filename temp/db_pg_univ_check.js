const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'haifeng', user:'postgres', password:'haifengweilaiguihuayuan' });
(async () => {
  await c.connect();
  console.log('=== t_postgrad_major 全量 ===');
  const pm = await c.query('SELECT id, major_code, major_name, status, is_deleted FROM t_postgrad_major ORDER BY id LIMIT 20');
  pm.rows.forEach(r => console.log(' ', JSON.stringify(r)));
  console.log('t_postgrad_major 行数:', pm.rows.length);
  console.log('=== t_university 前 10 条 ===');
  const uni = await c.query('SELECT id, name, status, is_deleted FROM t_university ORDER BY id LIMIT 10');
  uni.rows.forEach(r => console.log(' ', JSON.stringify(r)));
  console.log('=== ID 长度分布（判断是否雪花ID）===');
  const len = await c.query("SELECT id::text, length(id::text) AS l, count(*) OVER () AS n FROM t_postgrad_major LIMIT 5");
  len.rows.forEach(r => console.log('  id =', r.id, ' 长度 =', r.l, ' MAX_SAFE=9007199254740991, 超安全整数?', BigInt(r.id) > 9007199254740991n));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
