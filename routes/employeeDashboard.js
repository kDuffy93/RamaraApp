let express = require('express');
let router = express.Router();

let course = require('../models/course');
let user = require('../models/users');
let userCourse = require('../models/usercourses');
let passport = require('passport');
let session = require('express-session');
let localStrategy = require('passport-local').Strategy;
let plm = require('passport-local-mongoose');

//auth on every page
var department = require ('../models/department');
  /* GET department page */
  router.use( function(req, res, next) {

if(!req.user){
  req.session.messages =["You must be logged-in to view this page"];
  req.session.messages1 = ["please enter you're credentials below"];
   req.session.returnURL = [];
  req.session.returnURL = req.url;

  res.redirect('/login')
}
next();
  });
  router.use( function(req, res, next) {
  if(req.user.changepassword == true){
    res.redirect('/firstlogin')
  }
  next();
    });


/* GET the employee dashboard */
router.get('/', function(req, res, next) {
res.render('employeeDashboard', { title: 'Employee Dashboard', user: req.user });
});



//------------------------------for departments------------------------------------------------

// when the router gets a request at this get, load the departments homepage and pass in an array of departments
router.get('/department', function(req, res, next) {
   department.find(function(err, departments) {
      if (err) {
         console.log(err);
         res.end(err);
         return;
      }
      res.render('employee/department/departmentIndex', {
         departments: departments,
         title: 'Departments Index' , user: req.user
      });
   });
});

// load the add a department page upon get reuqest
router.get('/department/add', function(req, res, next) {
res.render('employee/department/add', {
         title: 'Add Department' , user: req.user
 });
});

// add the new department to the database assuming it meets validation critera when the router gets a post
router.post('/department/add', function(req, res, next) {
  department.create(
    {
        departmentname : req.body.departmentname
     }, function (err, departments)
        {
          if (err)
          {
              console.log(err);
              res.render('error');
              return;
          }
           res.redirect('/employeeDashboard/department');
    });
      });

// remove the department with a matching _id from the database
  router.get('/department/delete/:_id', function(req, res, next) {
    let _id = req.params._id;
  department.remove({ _id: _id }, function (err, departments) {
          if (err)
          {
              console.log(err);
              res.render('error');
              return;
          }
           res.redirect('/employeeDashboard/department');
    });
  });

// when the router gets a request at edit department it needs to get the id paramater of hte selected department from the querystring
// search the departments table for a matching record
// then load the edit page and pass the values to the view
  router.get('/department/:_id', function(req, res, next) {
   let _id = req.params._id;
   department.findById(_id, function(err, department) {
      if (err) {
         console.log(err);
         res.render('error');
         return;
      }
      //if theres a matchid id, load the edit page for that department
      res.render('employee/department/edit', {
         department: department,
         title: 'Edit Department' , user: req.user
      });
   });

});

// runs when the server gets a post request from the edit department table
router.post('/department/:_id', function(req, res, next) {
   let _id = req.params._id;
// populate a local department object to update with
   let Department = new department({
      _id: _id,
      departmentname : req.body.departmentname
   });

   // update the department record with the new values
   department.update({ _id: _id }, Department,  function(err) {
      if (err) {
         console.log(err);
         res.render('error');
         return;
      }
      res.redirect('/employeeDashboard/department');
   });
});


//------------------------------for users------------------------------------------------



  /* GET department page */
router.get('/manageEmployee', function(req, res, next) {
course.find(function(err, allCourses) {
     if (err) {
         console.log(err);
         res.end(err);
         return;
      }

  userCourse.find(function(err, allUserCourses) {
     if (err) {
         console.log(err);
         res.end(err);
         return;
      }

   user.find(function(err, users) {
      if (err) {
         console.log(err);
         res.end(err);
         return;
      }
      res.render('employee/manageEmployees/manageEmployeeIndex', {
        searchBy: "First Names",
        allUserCourses: allUserCourses,
        allCourses: allCourses,
         users: users,
         title: 'Users Index' , user: req.user
      });
   }).sort({surName: 'asc'}).exec(function(err, docs) {  });
});
 });
 });


router.get('/manageEmployees/add', function(req, res, next) {
  department.find(function(err, departments) {
      if (err) {
         console.log(err);
         res.end(err);
         return;
      }
      res.render('employee/manageEmployees/add', {
         departments: departments,
         title: 'Add User',
         user: req.user
      });
 });

});


router.post('/manageEmployees/add', function(req, res, next) {
  let lowerusername = req.body.username.toLowerCase();
  user.register(new user(
    {
       username: lowerusername,
        firstName : req.body.firstName,
        surName : req.body.surName,
        departmentname :  req.body.departmentname,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        changepassword: true
     }),
     req.body.password, function (err, departments)
        {
          if (err)
          {
              console.log(err);
              res.render('error'), { title: 'create new employee error'};
              return;
          }
           res.redirect('/employeeDashboard/manageEmployee');
    });
  });

  router.get('/manageEmployees/delete/:_id', function(req, res, next) {

    let _id = req.params._id;
  user.remove({ _id: _id }, function (err, departments) {
          if (err)
          {
              console.log(err);
              res.render('error');
              return;
          }
           res.redirect('/employeeDashboard/manageEmployee');
    });
  });

  router.get('/manageEmployees/:_id', function(req, res, next) {

   // grab id from the url
   let _id = req.params._id;
   department.find(function(err, departments) {

      if (err) {
         console.log(err);
         res.end(err);
         return;
      }


   // use mongoose to find the selected book
   user.findById(_id, function(err, userInfo) {
      if (err) {
         console.log(err);
         res.render('error');
         return;
      }

     var dptName = userInfo.departmentname;
      res.render('employee/manageEmployees/edit', {
         user: userInfo,
          departments: departments,
         title: 'Edit User',
         dptName: dptName
      });
    });
  });

});

// post for register / add new employee

router.post('/manageEmployees/:_id', function(req, res, next) {

   // grab id from url
   let _id = req.params._id;
   let lowerusername = req.body.username.toLowerCase();

if(req.body.password != "")
{
     if(req.body.password == req.body.confirm)
   {

    user.findById( _id, function(err, user) {
         if (!user) {
           req.flash('error', 'no user with that name');
           return res.redirect('back');
         }


         user.username= lowerusername;
       user.firstName = req.body.firstName;
         user.surName = req.body.surName;
         user.departmentname = req.body.departmentname;
           user.email= req.body.email;
           user.phonenumber= req.body.phonenumber;
           user.changepassword = true;
           console.log(user);
user.setPassword(req.body.password, function(){


         user.save(function(err) {

     res.redirect('/employeeDashboard/manageEmployee');
     });
         });
       });
  }
}
else {
  user.findById( _id, function(err, user) {
       if (!user) {
         req.flash('error', 'no user with that name');
         return res.redirect('back');
       }


       user.username= lowerusername;
     user.firstName = req.body.firstName;
       user.surName = req.body.surName;
       user.departmentname = req.body.departmentname;
         user.email= req.body.email;
         user.phonenumber= req.body.phonenumber;

         user.save(function(err) {
       res.redirect('/employeeDashboard/manageEmployee');
       });
});
}


});

/* let newUser = new user({

    _id: _id,
    username: lowerusername,
    firstName : req.body.firstName,
    surName : req.body.surName,
    departmentname : req.body.departmentname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,

 });
*/

/*  let workingUser =   user.findById(_id, function(err, userInfo) {
      if (!user) {
        req.flash('error', 'broken');
        return res.redirect('back');
      }
    });

    console.log(workingUser.password);


      workingUser.password = req.body.password;

console.log( workingUser.password);

  user.


   user.update({ _id: _id }, User,  function(err) {

      if (err) {
         console.log(err);
         res.render('error');
         return;
      }
      res.redirect('/employeeDashboard/manageEmployee');
   });*/
//------------------------------for employee Certificates------------------------------------------------
router.get('/employeeCertifications/:_id', function(req, res, next) {

   // grab id from the url
   let _id = req.params._id;
   user.findById(_id, function(err, users) {
      if (err) {
         console.log(err);
         res.render('error');
         return;
      }
course.find(function(err, courses) {

      if (err) {
         console.log(err);
         res.end(err);
         return;
      }

       res.render('employee/manageEmployees/cert', {
         users: users,
         uid: users._id,
courses: courses,
         title: 'Departments Index' , user: req.user
   });
 });
});
});


router.post('/employeeCertifications/:_id', function(req, res, next) {

   // grab id from url
   let user_id = req.params._id;

 userCourse.find({ 'userid' :  user_id },function(err, selectedUsersCourses) {

      if (err) {
         console.log(err);
         res.end(err);
         return;
      }
      console.log(selectedUsersCourses.length + "   " + selectedUsersCourses);

 if(selectedUsersCourses.length != 0)
 {
console.log("in if");

for (let i=0; i < selectedUsersCourses.length; i++) {
console.log("in for");
if(req.body.coursename == selectedUsersCourses[i].coursename)
{
 let updatedUserCourse = new userCourse({
      _id: selectedUsersCourses[i]._id,
      userid: user_id,
      coursename: req.body.coursename,
      expiry : req.body.expiry

   });
   console.log("populated new model");


   userCourse.update({ _id: selectedUsersCourses[i]._id }, updatedUserCourse,  function(err) {
      if (err) {
         console.log("from update" + err);
         res.render('error');
         return;
      }
      console.log("after update");

   });
 res.redirect('/employeeDashboard/manageEmployee');
 console.log("before return");
     return;
}

}
 console.log("before next()");

 }



userCourse.create(
    {
      userid: user_id,
      coursename: req.body.coursename,
      expiry : req.body.expiry

   });

      res.redirect('/employeeDashboard/manageEmployee');



   // populate new book from the form

   });
    });


    router.get('/viewEmployeeCertifications/:_id', function(req, res, next) {


   // grab id from the url
   let _id = req.params._id;
    user.findById(_id, function(err, users) {
      if (err) {
         console.log(err);
         res.render('error');
         return;
      }

   userCourse.find({ 'userid' :   _id }, function(err, userCourses) {
      if (err) {
         console.log(err);
         res.render('error');
         return;
      }


       res.render('employee/manageEmployees/viewemployeecertifications', {
         users: users,
         userCourses: userCourses,
         title: 'Departments Index' , user: req.user
   });
 });
});
});

  router.get('/viewEmployeeCertifications/delete/:_id/:user_id', function(req, res, next) {
console.log(req.params);
    let _id = req.params._id;
    let user_id = req.params.user_id;
  userCourse.remove({ _id: _id }, function (err, departments) {
          if (err)
          {
              console.log(err);
              res.render('error');
              return;
          }
           res.redirect('/employeeDashboard/viewEmployeeCertifications/' + user_id);
    });
  });



module.exports = router;
