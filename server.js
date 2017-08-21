//What do we need to do?
//1. GET request for '/'. render the page 'main.mustache' with homepage.
//  - get one word with this command: const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");.
//  - SPLIT and store said word in an empty array. ["a", "b", "c"]
//  - count word.length
//  - print out "_" which is equal to in number to word.length
//2. Under 'main.mustache', create a form. There should be a text input area for one word. Create a 'make a guess' button as well.
//3. POST request for '/guess' -- under this :
//  - validate to make sure only one letter is sent
//  - if input is more than one letter, tell them input is invalid and try again (ERR). render the page.
//  - if input.length === 1, change letter to toLowercase().
//  - loop through the array of words and if input ==== any member of the array, then print input to the index number of guesses (_____).

//Dependencies
const express = require('express');
const mustache = require('mustache-express');
const filesystem = require('fs');
const bodyparser = require('body-parser')
const session = require('express-session')

const server = express();

const users = [
  { username: "test", score: 10, tries: 8 },
  { username: "maria", score: 20, tries: 8 }
]

const guessedLetters = [];
let words = null;
let hiddenWord = null;

//Server configure
server.use(bodyparser.urlencoded({ extended: false }));
server.use(session({
    secret: '98rncailevn-_DT83FZ@',
    resave: false,
    saveUninitialized: true
}));

server.engine('mustache', mustache());
server.set('views', './views')
server.set('view engine', 'mustache');

//GET requests

server.get('/', function(request, response) {
  response.render('welcome');
})

server.get('/play', function(request, response) {
//TODO: include level here too.
  if (request.session.who !== undefined) {
    response.render('mainpage', {
      username: request.session.who.username,
      score: request.session.who.score,
      tries: request.session.who.tries,
      // previousGuess: previousGuess
      // level: request.session.who.level,
    });
  } else {
    response.redirect('/')
  }
});

server.get('/gameover', function(request, response) {
  response.render('gameover');
})

//POST requests
server.post('/', function(request, response) {
  response.redirect('/');
})

server.post('/start', function(request, response) {
  const username = request.body.newUsername;

  if (username !== null) {
    let user = {
      username: request.body.newUsername,
      score: 0,
      tries: 8
    };

    users.push(user);

    request.session.who = user;
    response.redirect('/play')
  } else {
    response.redirect('/')
  }

  words = filesystem.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")

  request.session.who.randomWord = words[Math.floor(Math.random()*words.length)];

  console.log(request.session.who.randomWord);
  console.log(users)

})

server.post('/guess', function(request, response) {
  if (request.session.who.tries > 1) {
    request.session.who.tries -= 1;
    response.redirect('/play');
    console.log (request.session.who.tries);

  } else {
    request.session.destroy();
    response.redirect('/gameover')
  }
})


server.listen(3000, function() {
   console.log("Server is runnin!");
})
