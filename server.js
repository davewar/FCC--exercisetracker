const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
// mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
 mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true})
.then((result)=>{
      console.log("all gd")
}).catch((err)=> { console.log(" dw err with cnn")
  console.log("dw eeeeeeee", err.message)});

  
// runs the first time only to conform all ggd.
const connection  = mongoose.connection;
connection.once('open', ()=> {
  console.log("all gd")
});


/////////////////////////////////////////////
// https://www.mongodb.com/cloud/atlas



////    	"mongoose": "^5.6.5",
//	"mongodb": "^3.0.0",

 
// create a new user
 const userSchema =  new mongoose.Schema({
  username: {type: String, required: true, trim:true, unique:true}

  // add unique:true
  });


//  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
// add exercise's
const trackerSchema = new  mongoose.Schema({

   userId: {type: String},
  description: {type: String , required: true, trim:true}, 
  duration: {type:Number,trim:true, required: true},
  date: {type: String, trim:true}
 


});

//create Model.   compile schema to model
const User = mongoose.model('User', userSchema);
 const Tracker = mongoose.model('Tracker', trackerSchema);


//add new user
var addPeople = function(arrayOfPeople, done) {
 
    User.create(arrayOfPeople,(err,data) => {
              // console.log(data)
              if(err){
                done(err);
              }
              done(null,data);
              return data;
    })
};




///add exercise
var addExercise = function(arrayOfPeople, done) {
 
    Tracker.create(arrayOfPeople,(err,data) => {
              // console.log(data)
              if(err){
                done(err);
              }
              done(null,data);
              return data;
    })
};

// /// /add exercise record

// const addExer = [  {username: "dw",description: 1, duration: 10, date: new Date()  } ];
// addExercise(addExer,function(){});

// {"_id":"5f7c4e7bfd88150030d4aa0b","username":"5as","count":2,"log":[{"description":"5555","duration":10,"date":"Tue Oct 06 2020"},{"description":"v","duration":10,"date":"Tue Oct 06 2020"}]}


app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



//1)  POST to      /api/exercise/new-user
// add new user
// return>  {"username":"aaaaa12","_id":"5f7c3e51fd88150030d4aa03"}

app.post("/api/exercise/new-user",(req,res)=>{
      
              // console.log(req.body)    //  {username:"ffdfdff"}
            
         let newUser = new User({username: req.body.username})

              newUser.save()    // is a promise
              .then((data)=>{
                      // console.log(data)   //  {contains _id and username}
                      let newUserObj = {
                            username:data.username,
                            _id: data.id
                      };
                      res.json(newUserObj)
              })
              .catch((err)=>{
                    if (err.message = "E11000"){
                      console.log("dw_er",err.message)
                      res.send("Username already taken");
                    } else{
                                        
                      console.log("dw_er",err.message)
                      res.status(404).json('error' + err.message)
                    }
              })
               
              // if u enter a dup record u get the below 

              //  "errorE11000 duplicate key error collection: <dbname>.users index: username_1 dup key: { username: \"1234\" }"

})


//2  GET   /api/exercise/users
// returns array of all records

app.get("/api/exercise/users", (req,res) => {

              User.find({},(err,data)=>{
                    if(err){
                         console.log("dw_er",err.message)
                      res.status(404).json('error' + err.message)
                      
                    }
                    console.log(" i got to this line")
                    res.json(data);


              })


})     //end of get




//3 // POST       /api/exercise/add       need id and if no date use today dte and then send a response of 
 // {"_id":"5f7c3e0ffd88150030d4aa01","username":"aaaa11","date":"Wed Oct 10 2018","duration":5,"description":"abc"}


//   5f7eed30eac7860cd1271817

// need username for json output -stores the name
let usernameExerciseAdd;

 app.post("/api/exercise/add", (req,res)=>{
      // console.log(req.body)    // returns userID,description duration date

            const userId = req.body.userId;
            const description = req.body.description;
            const duration = req.body.duration;
            let date = new Date(req.body.date).toDateString();

            
            if(date === "" || date ==="Invalid Date"){ 
                  date = new Date().toDateString()  ;       
            };

//get username
         //getusername for JSON response
                  // getUserNameDetails(id);

        let userdetailName =  User.findById(userId,(err,data)=>{
              if(err){console.log("here..")}
              else{
                    console.log(data);
                       usernameExerciseAdd = data.username
                                      
                  

                   
              }
              
        });
         
                

      // add the exercise to the Tracker table
      let newExercise = new Tracker({
            userId:  userId,
            duration:duration,
             description: description,
              date:date

      });        

      newExercise.save()
      .then((data)=>{
                // get userId
                // console.log("ffffff", usernameExerciseAdd)


               // {"_id":"5f7c3e0ffd88150030d4aa01","username":"aaaa11","date":"Wed Oct 10 2018","duration":5,"description":"abc"}
                

                res.json(
                            {
                              _id: data.userId,
                                  username : usernameExerciseAdd,
                                   date: data.date,
                                   duration  : data.duration,
                              description : data.description                       
                                
                                 
                            }

                )
              // res.json(data);
      })
      .catch((err)=>{
          console.log("dw_er",err.message);
                 res.status(404).json('dw error' + err.message);
      
     })

             
  })  //end of post





function getUserNameDetails(userId) {

    let userdetailName =  User.findById(userId,(err,data)=>{
              if(err){console.log("here..")}
              else{
                    console.log(data);
                       usernameExerciseAdd = data.username
               
              }
              
      });

}



//4  GET 
// https://exercise-tracker.freecodecamp.repl.co/api/exercise/log?userId=5f7c4e7bfd88150030d4aa0b
//returns   user + count of records + array of exercies
// {"_id":"5f7c4e7bfd88150030d4aa0b","username":"5as","count":2,"log":[{"description":"5555","duration":10,"date":"Tue Oct 06 2020"},{"description":"v","duration":10,"date":"Tue Oct 06 2020"}]}

//                /api/exercise/log?userId=5f7ebb1baf23e1016ae90148



//      Unknown userId
 app.get("/api/exercise/log", (req,res)=>{
              // test5 -filtering
           let limit  = req.query.limit;
           let toDate = req.query.to;
           let fromDate = req.query.from;
           limit = parseInt(limit)
           
         const id = req.query.userId ;
                  // console.log(id)

                    //getusername for JSON response
                  getUserNameDetails(id);
                  
      let locateRecords  = Tracker.find({userId: id} , (err, data) => {

                  if(err){ console.log("dw ", err.message)};

                                   
                  let result = { _id: data[0].userId, count: data.length,log: []   }

                  const logObj = data.map((item)=>{

                        const container = {};

                            container["description"] = item.description,
                            container["duration"] =  item.duration,
                              container["date"]  =   item.date

                        return container;

                  })

                    // console.log(logObj);
                    // add log details
                  result.log = logObj;
                       

                  // we need to filter result
                   if(limit){
                      console.log("query limit - i was here")
                          result.log = result.log.slice(0,limit)

                    }


                  //  /api/exercise/log?userId=5f7f3055cd9d790d3814d&from=2017-01-01
                  //  /api/exercise/log?userId=5f7f3055cd9d790d3814d&to=2016-01-01
                  if(fromDate){
                          fromDate = new Date(fromDate)
                          result.log = result.log.filter((item) => new Date(item.date) > fromDate);

                  }
                  if(toDate){
                          toDate = new Date(toDate)
                          result.log = result.log.filter((item) => new Date(item.date) < toDate);

                  }



                  result.count = result.log.length
                  // console.log("res", data);
                  console.log("dws", result);
                  // res.json(result);
                  // res.send("gfgfgf")

                 res.json(
                                {
                                      _id: result._Id,
                                      username : usernameExerciseAdd,
                                      count: result.count,
                                      log  : result.log
                                }

                            ) 






      })
           


}); /// <<end  get




//5  GET    sel      optional parameters of from & to or limit
//GET /api/exercise/log?{userId}[&from][&to][&limit]

// https://exercise-tracker.freecodecamp.repl.co/api/exercise/log?userId=5f7f174781931900386a6050&limit=2

// {"_id":"5f7f174781931900386a6050","username":"dweffrerwerwe","count":2,"log":[{"description":"hh","duration":3,"date":"Thu Oct 08 2020"},{"description":"hh","duration":3,"date":"Thu Oct 08 2020"}]}

//    /api/exercise/log?userId=5f7f3055cd9d790d3814d&from=2017-01-01



////////////////////////////////////////////////////////////////////////////////////////////








const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
