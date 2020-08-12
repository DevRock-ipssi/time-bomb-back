const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../../app');
const jwt = require('jsonwebtoken');
chai.use(chaiHttp);




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


/*
* POST /users/join-room
*/
describe('POST /users/join-room', () => {
  
  it('should join room', (done) => {

      let userData = {
          pseudo: "test", 
          pin:"2fadc276f6" //Pin valide
      };
      
      chai.request(server)
      .post('/users/join-room')
      .send(userData)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.a('object');
        res.body.should.have.property('message');
        done();
      });

  })


  it('should not join room because of missing required parameter', (done) => {

    let userData = {
        pseudo: "user"
    };
    chai.request(server)
    .post('/users/join-room')
    .send(userData)
    .end((err, res) => {
      res.should.have.status(500);
      res.should.be.a('object');
      res.body.should.have.property('message');
      done();
    });


  })


})


