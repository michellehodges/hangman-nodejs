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

let randomWordSplit = null;
let randomWordUnderscores = null;
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
      guessedLetters: request.session.who.guesses,
      underscores: request.session.who.underscores
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
      tries: 8,
      guessedLetters: [''],
    };

    users.push(user);
    request.session.who = user;

    words = filesystem.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")
    request.session.who.randomWord = words[Math.floor(Math.random()*words.length)];
    randomWordSplit = request.session.who.randomWord.split('');
    randomWordUnderscores = Array(randomWordSplit.length+1).join('_').split('');
    request.session.who.underscores = randomWordUnderscores;

    response.redirect('/play')
    } else {
      response.redirect('/')
      }
})

server.post('/guess', function(request, response) {
  if ((request.session.who.tries > 1) && (request.body.guess !== '')) {
    request.session.who.tries -= 1;
    request.session.who.guessedLetters.push(request.body.guess);

    if (randomWordSplit.indexOf(request.body.guess) !== -1) {

      //replace randomWordUnderscores (with matching index number as randomWordSplit[i]) with request.body.guess
      //add 10 to scores
    }

    response.redirect('/play');
    console.log('Guessed letter array: ' + request.session.who.guessedLetters)

  } else if (request.body.guess === '') {
    response.redirect('/play');

  } else {
    request.session.destroy();
    response.redirect('/gameover')
  }
})


server.listen(3000, function() {
   console.log("Server is runnin!");
})
