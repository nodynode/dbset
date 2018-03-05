const MigrationTable = require("MigrationTable")

class MigrationCollator {

	static equals(dbTable, newTable) {
		return newTable.uid == dbTable.uid;
	}

	static tableDifferences(dbTable, newTable) {

		if (!MigrationCollator.equals(dbTable, newTable))
			throw new Error('Not equal tables compared!');

		var differences = [];

		if (dbTable.name != newTable.name)
			differences.push({
				type: MigrationCollator.differenceTypes.tableName,
				oldName: dbTable.name,
				newName: newTable.name
			});

		var seperations = MigrationCollator.seperateColumns(dbTable, newTable);

		for (var i = 0, move; move = seperations.moves[i]; i++) {
			differences.push({
				type: MigrationCollator.differenceTypes.columnMovation,
				from: move.db,
				to: move.new
			});
		}

		for (var i = 0, modification; modification = seperations.modifications[i]; i++) {
			var difference = MigrationCollator.getColumnsDifference(modification.db, modification.new);
			if (difference != null) {
				differences.push(difference);
			}
		}

		for (var i = 0, creation; creation = seperations.creations[i]; i++) {
			differences.push({
				type: MigrationCollator.differenceTypes.columnCreation,
				column: creation
			});
		}

		for (var i = 0, deletation; deletation = seperations.deletations[i]; i++) {
			differences.push({
				type: MigrationCollator.differenceTypes.columnDeletation,
				column: deletation
			});
		}

		return differences;
	}

	static getColumnsDifference(dbColumn, newColumn) {
		if (!MigrationCollator.equals(dbColumn, newColumn))
			throw new Error('Not equal columns compared!');

		var difference = [];
		if (dbColumn.name != newColumn.name) {
			difference.push({
				type: MigrationCollator.differenceTypes.columnName,
				oldName: dbColumn.name,
				newName: newColumn.name
			});
		}

		if (dbColumn.type != newColumn.type) {
			difference.push({
				type: MigrationCollator.differenceTypes.columnType,
				oldType: dbColumn.type,
				newType: newColumn.type
			});
		}

		if (dbColumn.length != newColumn.length) {
			difference.push({
				type: MigrationCollator.differenceTypes.columnLength,
				oldLength: dbColumn.length,
				newLength: newColumn.length
			});
		}

		if (dbColumn.default != newColumn.default) {
			difference.push({
				type: MigrationCollator.differenceTypes.columnDefault,
				oldDefault: dbColumn.default,
				newDefault: newColumn.default
			});
		}

		if (dbColumn.nullable != newColumn.nullable) {
			difference.push({
				type: MigrationCollator.differenceTypes.columnNullable,
				oldNullable: dbColumn.nullable,
				newNullable: newColumn.nullable
			});
		}
		if (difference == []) {
			return null;
		} else {
			return {
				type: MigrationCollator.differenceTypes.column,
				differences: difference
			};
		}
	}

	static seperateColumns(dbTable, newTable) {
		var deletions = [];
		var creations = [];
		var modifications = [];
		var moves = [];

		var dbColumns = dbTable.columns;
		var newColumns = newTable.columns;

		for (var i = 0; i < dbColumns.length; i++) {
			for (var j = 0; j < newColumns.length; j++) {
				if (MigrationCollator.equals(dbColumns[i], newColumns[j])) {
					modifications.push({
						db: dbColumns[i],
						new: newColumns[j]
					});
					moves.push({
						db: i,
						new: j
					});
					dbColumns[i] = null;
					newColumns[j] = null;
				}
			}
		}

		for (var i = 0; i < dbColumns.length; i++) {
			if (dbColumns[i] != null)
				deletations.push(dbColumns[i]);

			MigrationCollator.changeMoves(moves, dbColumns[i].index, 1);
		}

		for (var i = 0; i < newColumns.length; i++) {
			if (newColumns[i] != null)
				creations.push(newColumns[i]);

			MigrationCollator.changeMoves(moves, dbColumns[i].index, -1);
		}

		for (var i = 0; i < moves.lenght; i++) {
			if (moves[i].db != moves[i].new) {
				moves[i].db = dbTable.columns[moves[i].db];
				moves[i].new = dbTable.columns[moves[i].new];
			}
		}

		return {
			modifitions: modifications,
			creations: creations,
			deletations: deletations,
			moves: moves
		};
	}

	static changeMoves(moves, index, value) {
		for (var i = 0; i < moves.length; i++) {
			if (moves[i].new >= index) {
				moves[i].new += value;
			}
		}

		return equals;
	}
}

MigrationCollator.differenceTypes = {
	tableName: "TABLE_NAME",
	column: "COLUMN",
	columnDeletation: "COLUMN_DELETATION",
	columnCreation: "COLUMN_CREATION",
	columnMovation: "COLUMN_MOVATION",
	columnName: "COLUMN_NAME",
	columnType: "COLUMN_TYPE",
	columnLength: "COLUMN_LENGTH",
	columnDefault: "COLUMN_DEFAULT",
	columnNullable: "COLUMN_NULLABLE",
};

module.exports = MigrationCollator;