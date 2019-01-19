const config = require('./config');
const TableStore = require('tablestore');
const Md5 = require('md5');
if (
  !config.tbaccessKeyId ||
  !config.tbsecretAccessKey ||
  !config.tbendpoint ||
  !config.tbinstancename
) {
  module.exports = {
    put: () => {
      return Promise.reject(new Error("Missing Table store config"));
    },
    get: () => {
      return Promise.reject(new Error("Missing Table store config"));
    },
    getSid: (type, id) => {
      return Promise.resolve(Md5(type + Date.now() + id));
    }
  }
} else {
  const tb =  new TableStore.Client({
    accessKeyId: config.tbaccessKeyId,
    secretAccessKey: config.tbsecretAccessKey,
    endpoint: config.tbendpoint,
    instancename: config.tbinstancename,
    maxRetries: 20
  });

  const put = (table, key, value) => {
    return new Promise((resolve, reject) => {
      if (!table || !key) return reject(new Error('Missing parameters'));
  
      const params = {
        tableName: table,
        condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
        primaryKey: key,
        attributeColumns: value
      };
  
      tb.putRow(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  };
  
  module.exports = {
    put,
    get: (table, key) => {
      return new Promise((resolve, reject) => {
        tb.getRow({
          tableName: table,
          primaryKey: key
        }, (err, result) => {
          if (err || !result || !result.row || !result.row.attributes) {
            return reject(err);
          }
          let data = {};
          for (let i = 0; i < result.row.attributes.length; i++) {
            let item = result.row.attributes[i];
            data[item.columnName] = item.columnValue;
          }
          resolve(data);
        });
      });
    },
    getSid: (type, typeId) => {
      return new Promise((resolve, reject) => {
        let params = {
          tableName: 'userSid',
          direction: TableStore.Direction.BACKWARD,
          inclusiveStartPrimaryKey: [
            { 'sid': TableStore.INF_MAX }
          ],
          exclusiveEndPrimaryKey: [
            { 'sid': TableStore.INF_MIN }
          ]
        };
    
        let condition = new TableStore.CompositeCondition(TableStore.LogicalOperator.AND);
        condition.addSubCondition(new TableStore.SingleColumnCondition('type', type, TableStore.ComparatorType.EQUAL));
        condition.addSubCondition(new TableStore.SingleColumnCondition('typeId', typeId, TableStore.ComparatorType.EQUAL));
    
        params.columnFilter = condition;

        tb.getRange(params, function (err, data) {
          let sid = '';
          if (!err && data.rows && data.rows[0]) {
            data.rows[0].primaryKey.map(keyItem => {
              if (keyItem.name == 'sid') sid = keyItem.value;
            });
            resolve(sid);
          } else {
            sid = Md5(type + Date.now() + typeId);
            put('userSid', [{ sid }], [
              { type },
              { typeId }
            ]).then(putRes => {
              resolve(sid);
            }).catch(e => {
              resolve(sid);
            });
          }
        });
      });
    }
  }
}



