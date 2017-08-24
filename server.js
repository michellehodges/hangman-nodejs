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
server.set('views', './views');
server.set('view engine', 'mustache');
server.use(express.static('views'));

//GET requests

server.get('/', function(request, response) {
  response.render('welcome');
})

server.get('/play', function(request, response) {
  if (request.session.who !== undefined) {
    response.render('mainpage', {
      username: request.session.who.username,
      score: request.session.who.score,
      tries: request.session.who.tries,
      guessedLetters: request.session.who.guessedLetters,
      underscores: request.session.who.underscores,
    });
  } else {
    response.redirect('/')
  }
});

server.get('/gameover', function(request, response) {
  response.render('gameover', {
    score: request.session.who.score,
  });
  request.session.destroy();
})

server.get('/youwin', function(request, response) {
  response.render('youwin', {
    username: request.session.who.username,
    score: request.session.who.score,
  })
})

//POST requests
server.post('/', function(request, response) {
  response.redirect('/');
})

server.post('/start', function(request, response) {
  const username = request.body.newUsername;
  const level = request.body.level;

  if (username !== null) {
    let user = {
      username: request.body.newUsername,
      score: 0,
      tries: 8,
      guessedLetters: [],
    };

    users.push(user);
    request.session.who = user;

    words = filesystem.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")

    words.forEach(function(){
      word = words[Math.floor(Math.random()*words.length)];
      if (level === "easy") {
        if ((word.length >= 4) && (word.length <= 6)) {
          request.session.who.randomWord = word;
        }
      }
      else if (level === "medium") {
        if ((word.length >= 6) && (word.length <= 8)) {
          request.session.who.randomWord = word;
        }
      }
      else if (level === "hard") {
        if (word.length >= 8) {
          request.session.who.randomWord = word;
        }
      }
    })

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
  //GUYS, super cool thing mike taught me about input validation.
  let lowercaseGuess = request.body.guess.toLowerCase()[0];

    if ((request.session.who.tries > 0) && (lowercaseGuess !== '') && (request.session.who.guessedLetters.indexOf(lowercaseGuess) === -1)) {

      request.session.who.guessedLetters.push(lowercaseGuess);
      if (randomWordSplit.indexOf(lowercaseGuess) === -1) {
        request.session.who.tries -= 1;
        if (request.session.who.tries === 0) {
        response.redirect('/gameover')
        }
      }

      while ((randomWordSplit.indexOf(lowercaseGuess) !== -1) && (request.session.who.underscores.indexOf('_') !== -1)) {

        request.session.who.score += 10;
        let index = randomWordSplit.indexOf(lowercaseGuess);
        request.session.who.underscores[index] = randomWordSplit[index];
        randomWordSplit[index] = '';
      }

      if (request.session.who.underscores.indexOf('_') === -1) {
        response.redirect('/youwin');
      }

  }
    response.redirect('/play');
})


server.listen(3000, function() {
   console.log("Server is runnin!");
})
