const mysql = require('mysql')
const squel = require('squel')
const Bluebird = require('bluebird')
const Connection = require('mysql/lib/Connection')
const Pool = require('mysql/lib/Pool')

Bluebird.promisifyAll(Connection.prototype)
Bluebird.promisifyAll(Pool.prototype)

const pool = mysql.createPool({
	host: 'rds25l291952t4891u00.mysql.rds.aliyuncs.com',
	user: 'qjcg',
	password: 'mysqlqiji',
	database: 'qjcg'
})

let now = Date.now()

let sql = squel.select()
	.from('T_TERMINAL_INFO', 't')
	.left_join('T_CARD', 'i', 't.iccid = i.iccid')
	.left_join('T_CAR_TERMINAL', 'ct', 'ct.tid = t.tid')
	.left_join('T_CAR', 'c', 'c.car_id = ct.car_id')
	.left_join('T_GROUP_CAR', 'gc', 'gc.car_id = c.car_id')
	.left_join('T_GROUP', 'g', 'g.gid = gc.group_id')
	.left_join('T_CORP', 'co', 'g.cid = co.cid')
	.left_join(squel.select().field('o.oid').field('o.mobile').field('g.cid')
		.from('T_OPERATOR', 'o')
		.join('T_GROUP_OPERATOR', 'go', 'go.oper_id = o.oid')
		.join('T_GROUP', 'g', 'g.gid = go.group_id and g.level = 1 and pgid = "0"')
		.where('o.type = 1'), 'o', 'co.cid = o.cid')

;['tid', 'firmware_version', 'sn', 'activate_code', 'iccid',
	'begintime', 'endtime', 'pre_install', 'status', 'terminal_mode',
	'charge_status', 'pbat', 'gsm', 'gps', 'login_reason',
	'login_time'
].forEach(field => sql.field('t.' + field, field))
sql.field('(CASE WHEN t.activate_time != 0 AND t.login = 0 THEN t.offline_time ELSE null END)', 'offline_time')
let terminal_status_field = `(
	CASE WHEN t.activate_time = 0 THEN
		0
	ELSE
		CASE WHEN t.login = 0 THEN
			CASE WHEN t.pbat < 5 THEN
				2
			ELSE
				3
			END
		ELSE
			1
		END
	END
)`
sql.field(terminal_status_field, 'terminal_status')
let terminal_version_field = 'CONCAT(t.product_version, t.firmware_version, t.firmware_c, t.firmware_l)'
sql.field(terminal_version_field, 'terminal_version')

sql.field('c.car_id')
;['vin', 'cnum'].forEach(field => sql.field('c.' + field, 'car_' + field))
;['oid', 'mobile'].forEach(field => sql.field('o.' + field, 'main_' + field))
;['mobile'].forEach(field => sql.field('i.' + field, 'iccid_' + field))
;['cid', 'name'].forEach(field => sql.field('co.' + field, 'corp_' + field))
;['name'].forEach(field => sql.field('g.' + field, 'group_' + field))

sql = sql.toString()

console.log('Parse %d ms', Date.now() - now)

pool.queryAsync(sql).then((rs) => {
	console.log('Finish %d ms', Date.now() - now)
	console.log('Count = %j', rs.length)
})
