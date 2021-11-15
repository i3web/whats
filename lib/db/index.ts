import ora from 'ora';
import Table from 'tty-table';

import DatabaseManager, { SearchStruct } from './DatabaseManager';
import ConfigStoreManager, { ConfigItem } from '../ConfigManager';


/**
 * 打印查询结果表格
 *
 * @param {SearchStruct[]} rawTuples - 查询结果对象数组
 */
const logAsTable = (rawTuples: SearchStruct[]) =>
{
	const limit = ConfigStoreManager.getInstance().getConfig(ConfigItem.RECORD_LIMIT);

	const tuples = rawTuples.slice(0, limit);
	const header = Object.keys(tuples[0]).map(k => ({ value: k }));

	const table = Table(header, tuples, { truncate: '..' });

	console.log(table.render());
};

// 查询数据库记录
const searchDBReacord = async () =>
{
	const db = DatabaseManager.getInstance().getDBInstance()
	const created = ConfigStoreManager.getInstance().getConfig(ConfigItem.DB_CREATED)
	const spinner = ora('请稍后...').start();

	try
	{
		if (!created) return spinner.warn('暂无查询结果');

		console.time('Time');

		const tuples = await DatabaseManager.getInstance().searchDB();

		spinner.succeed('查询成功！');
		logAsTable(tuples);
		console.log('');

		console.timeEnd('Time');
	}
	catch (e)
	{
		spinner.fail('出错了！');
	}
	finally
	{
		db && db.close();
	}

};

export default searchDBReacord