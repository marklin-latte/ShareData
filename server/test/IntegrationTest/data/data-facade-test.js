debugger;
var mongoose = require('mongoose');
var config = require('../test-config');
var chai = require('chai');
var expect = chai.expect;

var DataFacade = require('../../../model/data/data-facade');
var Schema = require('../../../model/data/data-schema');
var Facade = new DataFacade(Schema);

describe('Integration: data-facade.js -- Get Data', () => {
  before(() => {
    config.connect((err) => {
      if (err) {
        console.log(err.message);
      }
    });
  });

  after(() => {
    config.close((msg) => {
      console.log(msg);
    });
  });


  it('should return datas and clear datas', (done) => {
		let obj = [{"id":"1"},{"id":"2"},{"id":"3"}];
    let datas = {
      "data": obj,
      "describe": "test",
      "author": "Mark"
    }
    let createResult = Facade.create(datas);
    createResult.then((data) => {
      return Facade.find({
        "_id": data._id.toString() 
      });
    }).then((data) => {
      expect(data.length).to.equal(1);
      var removeId = data[0]._id.toString();
      return Facade.remove(removeId);
    }).then((msg) => {
      done();
    }).catch((err) => {
      console.log(err);
    });

  });

});