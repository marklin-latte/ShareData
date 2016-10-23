
class DataModel {

  constructor(Schema, DataDetailSchema) {
    this.maxSize = 1000;
    this.Schema = Schema;
    this.DataDetailSchema = DataDetailSchema;
  }

  create(input) {
    let data = input.data,
      dataLength = data.length,
      asyncSize = Math.ceil(dataLength / this.maxSize),
      asyncFucs = [];

    var result;
    var saveDataResult = this.saveData(input, () => {
      console.log("Save Data Success")
    });

    var result = new Promise((resolve, reject) => {
      saveDataResult.then((data) => {
        let dataId = data._id.toString();
        var asyncData = this.splitData(dataId, input, asyncSize);

        for (var i = 0; i < asyncSize; i++) {
          asyncFucs.push(this.bulkSaveDataDetail(asyncData[i]));
        }

        Promise.all(asyncFucs).then(msgs => {
            resolve(msgs);
        });

      }).catch((err) => {
        console.log(err);
      });
    });
    return result;
  }

  splitData(dataId, input) {
    let result = [],
      dataLength = input.data.length,
      maxSize = this.maxSize || 10000,
      size = Math.ceil(dataLength / maxSize);

    for (var i = 0; i < size; i++) {
      if (size == 1) {
        result.push(input);
      } else {
        let obj = {
          data: input.data.slice(i * 1000, (i + 1) * 1000),
          dataId: dataId,
          isFinal: false || i == (size - 1)
        };
        result.push(obj);
      }
    }
    return result;
  }

  saveData(data, callback) {
    const schema = new this.Schema(data);
    let promise = new Promise((resolve, reject) => {
      schema.save((err, data) => {
        if (err) {
          reject(err);
          callback("Save Data Fail");
        } else {
          resolve(
            data
          );
          callback("Save Data Success");
        }
      });
    });
    return promise;
  }

  bulkSaveDataDetail(datas, callback) {
    let promise = new Promise((resolve, reject) => {
      this.DataDetailSchema.collection.insert(datas, (err, datas) => {
        if (err) {
          reject(err);
        } else {
          resolve(datas);
        }
      });
    });
    return promise;
  }

  find(query) {
    var promise = new Promise((resolve, reject) => {
      this.Schema.find(query, (err, data) => {
        resolve(data);
      });
    })
    return promise;
  }

  remove(id) {
    var promise = new Promise((resolve, reject) => {
      this.Schema.findByIdAndRemove(id, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    return promise;
  }

  //update(id, newData) {
  //var promise = new Promise((resolve, reject) => {
  //this.Schema.findOneAndUpdate(query, newData, {
  //upsert: true
  //}, (err, data) => {
  //if (err) {
  //reject(err);
  //} else {
  //resolve(data);
  //}
  //})
  //})
  //return promise;
  //}
}
module.exports = DataModel;
