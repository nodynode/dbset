const PATH = require('path');
const fs = require('fs');

const uuid = require('uuid');

class MigrationTable {
	/**
	 * creates new MigrationTable instance
	 * @param {String} name 
	 */
	constructor(name) {
		this.name = name;
		this.columns = [];
	}

	/**
	 * Gets migration table file and returns MigrationTable
	 * @param {String} path 
	 */
	static parseFile(path) {
		var structure = MigrationTable.optimize(path);

		var table = new MigrationTable(PATH.basename(path, '.json'));

		for (var i = 0, column; column = structure.columns[i]; i++){
			column.index = i;
			table.addColumn(column);
		}

		return table;
	}

	static optimize(path) {
		var structure = JSON.parse(
			fs.readFileSync(path,
				{ encoding: 'utf-8' }
			)
		);

		if (!structure.hasOwnProperty('uid')) {
			structure.uid = MigrationTable.generateUID();
		}

		for (var i = 0; i < structure.columns.length; i++) {
			if(!structure.columns[i].hasOwnProperty('uid'))	{
				structure.columns[i].uid = MigrationTable.generateUID();
			}
		}

		fs.writeFileSync(path,
			JSON.stringify(structure, null, "\t"),
			{ encoding: 'utf-8' }
		);

		return structure;
	}

	//TODO: Validation
	/**
	 * Adds standard column object to migration table
	 * @param {Object} column 
	 */
	addColumn(column) {
		this.columns.push({
			uid: column.uid,
			index: column.index,
			name: column.name,
			type: column.type,
			length: column.length || null,
			nullable: column.nullable || false,
			default: column.default || null,
		});
	}

	genetareSQL(driver) {
		var sql = '';
		driver.makeTable();
	}

	static generateUID() {
		return uuid();
	}
}

module.exports = MigrationTable;