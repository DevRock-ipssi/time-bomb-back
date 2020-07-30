const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../../app');
const jwt = require('jsonwebtoken');
chai.use(chaiHttp);
const Room = require('../../api/models/roomModel'); 


function serverError(resData){
  resData.should.have.status(500);
  resData.should.be.a('object');
  resData.body.should.have.property('message');
  resData.body.message.should.equal('Erreur serveur.');
}




/*
* POST /users/init-room
*/
 describe('POST /users/init-room', () => {
  
    it('should init room', (done) => {

        let userData = {
            pseudo: "userTest"
        };
        
        chai.request(server)
        .post('/users/init-room')
        .send(userData)
        .end((err, res) => {
          res.should.have.status(201);
          res.should.be.a('object');
          res.body.should.have.property('info');
          res.body.should.have.property('token');
          done();
        });

    })

 
    it('should not init room because of missing required parameter', (done) => {

      let userData = {
          pseudo: ""
      };
      chai.request(server)
      .post('/users/init-room')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(400);
        res.should.be.a('object');
        res.body.should.have.property('message');
        done();
      });


    })


})



