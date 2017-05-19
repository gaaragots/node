var express = require('express');
var router = express.Router();

var passport         = require( 'passport' )
  , util             = require( 'util' )
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy
  , FacebookStrategy = require('passport-facebook').Strategy;

var GOOGLE_CLIENT_ID      = "810695563265-kkijms1irc8njdisqrv0tmu09ipuq40m.apps.googleusercontent.com"
  , GOOGLE_CLIENT_SECRET  = "UTorCcZqblgasF1h84fNiXw-";

var	FACEBOOK_APP_ID 	= '1960354484198795'
  , FACEBOOK_APP_SECRET	= '8ca0949107e04b46d3d2addef207e379';

passport.serializeUser(function(user, done) {
	console.log("serializeUser");
  	done(null, user);
});

passport.deserializeUser(function(user, done) {
	console.log("deserializeUser");
  	done(null, user);
});

passport.use(new GoogleStrategy(
	{
		clientID:     GOOGLE_CLIENT_ID,
		clientSecret: GOOGLE_CLIENT_SECRET,
		callbackURL: "http://localhost:3000/auth/google/callback",
		passReqToCallback   : true
	},
	function(request, accessToken, refreshToken, profile, done) {
		// asynchronous verification, for effect...
    	process.nextTick(function () {
    		return done(null, profile);
    	});
  	}
));
passport.use(new FacebookStrategy(
	{
		clientID: FACEBOOK_APP_ID,
    	clientSecret: FACEBOOK_APP_SECRET,
    	callbackURL: "http://localhost:3000/auth/facebook/callback"
  	},
  	function(accessToken, refreshToken, profile, done) {
    	process.nextTick(function () {
    		return done(null, profile);
    	});
  	}
));

// configure Express
router.use( cookieParser()); 
router.use( bodyParser.json());
router.use( bodyParser.urlencoded({
	extended: true
}));
router.use( session({ 
	secret: 'cookie_secret',
	name:   'kaas',
	proxy:  true,
    resave: true,
    saveUninitialized: true
}));
router.use( passport.initialize());
router.use( passport.session());

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express', user: req.user });
});

router.get('/api', function(req, res, next) {
	if (req.isAuthenticated()) {
		var data = {}

		if (req.user.provider == 'google') {
			data = {
				provider: req.user.provider,
				id: req.user.id,
				displayName: req.user.displayName,
				name: {
					familyName: req.user.name.familyName,
					givenName: req.user.name.givenName
				},
				email: req.user.email,
				photoURL: req.user.photos[0].value,
			}
		}

		if (req.user.provider == 'facebook') {
			data = {
				provider: req.user.provider,
				id: req.user.id,
				displayName: req.user.displayName,
				name: {
					familyName: null,
					givenName: null
				},
				email: null,
				photoURL: 'http://graph.facebook.com/v2.9/' + req.user.id + '/picture',
			}
		}
			
		res.json(data);
	} else {
		res.json({});
	}
});

// router.get('/api/google', function(req, res, next) {
// 	if (req.isAuthenticated()) {
// 		var data = {
// 			provider: req.user.provider,
// 			id: req.user.id,
// 			displayName: req.user.displayName,
// 			name: {
// 				familyName: req.user.name.familyName,
// 				givenName: req.user.name.givenName
// 			},
// 			email: req.user.email,
// 			photo: req.user.photos[0].value,
// 		}
// 		res.json(data);
// 	} else {
// 		res.json({});
// 	}
// });


router.get('/login/google', passport.authenticate('google', { scope: [
	'https://www.googleapis.com/auth/plus.login',
   	'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));

router.get( '/auth/google/callback', 
	passport.authenticate( 'google', { 
		successRedirect: '/',
		failureRedirect: '/'
	}
));

router.get('/login/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
	passport.authenticate( 'facebook', { 
		successRedirect: '/',
		failureRedirect: '/'
	}
));

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { 
		return next(); 
	}

	res.redirect('/login');
}


module.exports = router;