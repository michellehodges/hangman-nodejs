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

server.get('/youwin', function(request, response) {
  response.render('youwin')
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

    console.log(randomWordSplit);

    response.redirect('/play')
    } else {
      response.redirect('/')
      }
})

server.post('/guess', function(request, response) {
  let lowercaseGuess = request.body.guess.toLowerCase();

  if ((request.session.who.tries > 1) && (lowercaseGuess !== '')) {
    request.session.who.tries -= 1;
    request.session.who.guessedLetters.push(lowercaseGuess);

    while (randomWordSplit.indexOf(lowercaseGuess) !== -1 && request.session.who.underscores.indexOf('_') > -1) {
      request.session.who.score += 10;
      let index = randomWordSplit.indexOf(lowercaseGuess);
      request.session.who.underscores[index] = randomWordSplit[index];
      randomWordSplit[index] = '';
    }

    response.redirect('/play');

    if (randomWordSplit.indexOf('_') === -1) {
      response.redirect('/youwin');
    }

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


// TODO: ISSUES
// 1) need to post to youwin
// 2) when word is complete it doesnt automatically redirect
// 3) game mustache doesnt show scores
// 4) scoreboard needs to populate
// 5) need to connect css
