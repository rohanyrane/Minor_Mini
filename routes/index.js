var express = require('express');
var app = express()
var router = express.Router();
var db = require('../database')
const {
  v4: uuidv4
} = require('uuid')
const bcrypt = require('bcrypt')
let resultObj={}

router.get("/", (req, res) => {
  res.render("customerReg")
})
router.post("/", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const phno = req.body.phno;
  const password = req.body.password;
  const saltRounds = 10;
  const encryptedPassword = await bcrypt.hash(password, saltRounds)

  db.query(
    `INSERT INTO Customer (cust_id,cust_name,cust_phno ,cust_email,cust_pass) VALUES (?,?,?,?,?)`,
    [uuidv4(), name, phno, email, encryptedPassword],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values Inserted");
      }
    }
  );
  res.redirect('/login')
});
router.get("/login", (req, res) => {
  res.render("customerLogin")
})
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.query(`SELECT cust_pass FROM Customer WHERE cust_email=?`, [email], async (err, result) => {
    console.log(result);
    if (err) {
      res.send({
        "code": 400,
        "failed": "error occurred",
        "error": err
      })
    } else {
      if (result) {
        const comparison = await bcrypt.compareSync(password.toString(), result[0].cust_pass)
        if (comparison) {
          // console.log("Auth Success");
          res.redirect("/home")
        } else {
          res.send("Auth declined")
          // console.log("Declined");
        }
      }
    }
  })
})

router.get("/addMovie", (req, res) => {
  res.render("addMovie")
})

router.post("/addMovie", (req, res) => {
  const {
    m_title,
    m_duration,
    m_banner

  } = req.body;
  db.query(`INSERT INTO Movie VALUES (?,?,?,?)`, [uuidv4(), m_title, m_duration, m_banner], async (err, result) => {
    // console.log("Movies in Database are ",result);
    if (err) {
      res.send({
        "code": 400,
        "failed": "error occurred",
        "error": err
      })
    } else {
      console.log("Movie has been successfully added");
      res.redirect('/home');
    }
  })
})

router.get('/home', (req, res) => {
  db.query(`SELECT * FROM Movie `, async (err, result) => {
    // console.log([...result]);    
    if (err) {
      res.send({
        "code": 400,
        "failed": "error occurred",
        "error": err
      })
    } else {
      // console.log("Movie has been successfully added");
      result = JSON.stringify(result);
      result = JSON.parse(result);

      res.render('landingPage', {
        result
      })
    }
  })


})
router.get('/bookMovie/:movie_id', (req, res) => {
  
  const {
    movie_id
  } = req.params
  //query for 
  // db.query(`insert into screening values (?,?,?,?)`)
  db.query('SELECT * FROM screening WHERE m_id=?', [movie_id], async (err, result) => {

    if (err) {
      res.send({
        "code": 400,
        "failed": "error occurred",
        "error": err
      })
    } else {
      result = JSON.stringify(result)
      result = JSON.parse(result);
     
      resultObj["screening"]=result
      
      res.redirect("/loadBookingPage")
    }
  })
});
router.get("/loadBookingPage",(req,res)=>{
 console.log(resultObj)
  res.render("bookMovies",{resultObj})
})

router.get("/loadSeats/:s_id", (req, res) => {
  const {
    s_id
  } = req.params
  db.query(`SELECT * FROM seat WHERE s_id=? order by seat_no Asc`, [s_id], async (err, result) => {
    if (err) {
      res.send({
        "code": 400,                                                                                                                                                                                                                                                                                
        "failed": "error occurred",
        "error": err
      })
    } else {
      // result = JSON.parse(result);
      result = JSON.stringify(result)
      result = JSON.parse(result);
      
      resultObj["seats"]=result

      
      res.redirect("/loadBookingPage")
    }
  })
});

router.get("/createScreening/:id", (req, res) => {
  const {
    id
  } = req.params
  res.render("createScreening", {
    id
  })
})
router.post("/createScreening/:id", (req, res) => {
  const {
    id
  } = req.params
  const {
    s_no,
    s_seats,
    s_date
  } = req.body
  const s_id = uuidv4()
  db.query(`INSERT INTO Screening  (s_id,m_id,s_no,s_seats,s_date) VALUES (?,?,?,?,?)`, [s_id, id, s_no, s_seats, s_date], async (err, result) => {
    // console.log("Movies in Database are ",result);
    if (err) {
      res.send({
        "code": 400,
        "failed": "error occurred",
        "error": err
      })
    } else {
      for (i = 1; i < 100; i++) {
        db.query(`INSERT INTO seat(s_id,seat_id,seat_no,s_price) VALUES (?,?,?,?)`, [s_id, uuidv4(), i, 250])
      }
      res.send("Screening has been successfully added");
    }
  })


})
router.post('/confirm',(req,res)=>{
  // let seats=[...req.body]
  console.log(req.body)
  for(let seat in req.body){
  //  console.log(req.body[seat])
  db.query(`UPDATE seat SET s_status="Booked" WHERE seat_id=? `,[req.body[seat]])
  }
  res.send("Booked successfully")
})



module.exports = router;