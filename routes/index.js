const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const auth = require('http-auth');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/index', (req, res) => {
  res.render('index', { title: 'Food & Recipes', isHomePage: true });
});

router.get('/form', (req, res) => {
  //res.send('It works!');
  res.render('form', { title: 'Registration form' });
});

router.get('/registrations', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('register', { title: 'Listing registrations', registrations, admin: true });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

router.post('/',
    [
        check('name')
            .isLength({min: 1})
            .withMessage('Please enter a name'),
        check('email')
            .isLength({min: 1})
            .withMessage('Please enter an email'),
        check('username')
            .isLength({min: 1})
            .withMessage('Please enter Username'),
        check('password')
            .isLength({min: 1})
            .withMessage('Enter your correct password'),
    ],
    async(req, res) => {
        //console.log(req.body);
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            const registration = new Registration(req.body);
            // Generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // set user password to hashed password
            registration.password = await bcrypt.hash(registration.password, salt);
            registration.save()
                .then(() => {
                    res.render('thankyou')
                })
                .catch((err) => {
                    console.log(err);
                    res.send('Sorry! Something went wrong.');
                });
        } else {
            res.render('form', {
                title: 'Registration form',
                errors: errors.array(),
                data: req.body,
            });
        }
    });

module.exports = router;