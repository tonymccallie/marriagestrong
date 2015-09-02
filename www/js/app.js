var DOMAIN = 'http://marriagestrong.server1.greyback.net/'
//DEVELOPMENT
var devtest = /localhost/.test(window.location.hostname);
if (devtest) {
	DOMAIN = 'http://localhost/marriagestrong_server';
	isMobile = false;
}
devtest = /threeleaf/.test(window.location.hostname);
if (devtest) {
	DOMAIN = 'http://office.threeleaf.net:8080/marriagestrong_server';
	isMobile = false;
}

//TEMP
//var DOMAIN = 'http://office.threeleaf.net:8080/marriagestrong_server';

var onclickFix = function (html) {
	html = html.replace(/href=\"\//ig, 'href="http://www.marriagestrong.org/');
	html = html.replace(/src=\"\//ig, 'src="http://www.marriagestrong.org/');
	return html.replace(/href=\"(.+?)\"/gi, 'onclick="window.open(\'$1\',\'_system\',\'location=yes\');"');
}

angular.module('greyback', ['ionic', 'ngCordova', 'ImgCache', 'ionic.service.core', 'ionic.service.push', 'ionic.service.deploy', 'ionic.service.analytics', 'ionic-datepicker', 'ngOpenFB', 'ngMessages', 'jrCrop', 'greyback.controllers', 'greyback.services', 'greyback.utils'])

.run(function ($rootScope, $ionicPlatform, $ionicAnalytics, $cordovaSplashscreen, ImgCache, ngFB) {
	console.log('App.run');
	ngFB.init({
		appId: '850066335072761',
		oauthRedirectURL: DOMAIN + '/users/oauthlogin',
		logoutRedirectURL: DOMAIN + '/users/oauthlogout',
	});
	$ionicPlatform.ready(function () {
		console.log('platform.ready');
		$ionicAnalytics.register();
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			$cordovaSplashscreen.hide();
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			$cordovaStatusBar.style(2);
		}
		ImgCache.$init();
	});
})

.config(function ($ionicAppProvider, ImgCacheProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	// Identify app
	$ionicAppProvider.identify({
		// The App ID (from apps.ionic.io) for the server
		app_id: 'b5459458',
		// The public API key all services will use for this app
		api_key: '3dba898087ab6ad516d3bd91dc801fba79ddaf871b12ca36',
		// Set the app to use development pushes
		dev_push: true
	});

	ImgCacheProvider.manualInit = true;

	$ionicConfigProvider.backButton.previousTitleText(false).text('<i class="threeleaf">5</i>').icon('');
	$ionicConfigProvider.tabs.position('bottom');

	$stateProvider

	.state('menu', {
		url: "/menu",
		abstract: true,
		templateUrl: "templates/menu.html",
		controller: 'AppController',
		resolve: {
			user: function (UserService) {
				console.log('Config.state.menu.resolve.user');
				return UserService.checkUser();
			}
		}
	})

	.state('menu.tabs', {
		url: "/tabs",
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: "templates/tabs.html",
			}
		}
	})

	.state('menu.tabs.home', {
		url: "/home",
		views: {
			'tab-static': {
				templateUrl: "templates/home.html",
				controller: 'HomeController',
			}
		}
	})

	.state('menu.tabs.usness', {
		url: "/usness",
		views: {
			'tab-home': {
				templateUrl: "templates/usness.html",
			}
		}
	})

	.state('menu.tabs.usness_activities', {
		url: "/usness-activities",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_activities.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_activities_further', {
		url: "/usness-activities-further",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_activities_further.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_personality', {
		url: "/usness-personality",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_personality.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_personality_results', {
		url: "/usness-personality-results",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_personality_results.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_personality_results_spouse', {
		url: "/usness-personality-results-spouse",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_personality_results_spouse.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_gifts', {
		url: "/usness-gifts",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_gifts.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_gifts_results', {
		url: "/usness-gifts-results",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_gifts_results.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.usness_gifts_results_spouse', {
		url: "/usness-gifts-results-spouse",
		views: {
			'tab-home': {
				templateUrl: "templates/usness_gifts_results_spouse.html",
				controller: "UserController"
			}
		}
	})


	.state('menu.tabs.cycles', {
		url: "/cycles",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.cycles_pain', {
		url: "/cycles-pain",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles_pain.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.cycles_pain_copes', {
		url: "/cycles-pain-copes",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles_pain_copes.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.cycles_pain_results', {
		url: "/cycles-pain-results",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles_pain_results.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.cycles_peace', {
		url: "/cycles-peace",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles_peace.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.cycles_peace_response', {
		url: "/cycles-peace-response",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles_peace_response.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.cycles_results', {
		url: "/cycles-results",
		views: {
			'tab-cycles': {
				templateUrl: "templates/cycles_results.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.4steps', {
		url: "/4steps",
		views: {
			'tab-4steps': {
				templateUrl: "templates/4steps.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.4steps_setup', {
		url: "/4steps-setup",
		views: {
			'tab-4steps': {
				templateUrl: "templates/4steps_setup.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.4steps_results', {
		url: "/4steps-results",
		views: {
			'tab-4steps': {
				templateUrl: "templates/4steps_results.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.quizzes', {
		url: "/quizzes",
		views: {
			'tab-quizzes': {
				templateUrl: "templates/quizzes.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.quizzes_usness', {
		url: "/quizzes-usness",
		views: {
			'tab-quizzes': {
				templateUrl: "templates/quizzes_usness.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.quizzes_usness_results', {
		url: "/quizzes-usness-results",
		views: {
			'tab-quizzes': {
				templateUrl: "templates/quizzes_usness_results.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.quizzes_boundaries', {
		url: "/quizzes-boundaries",
		views: {
			'tab-quizzes': {
				templateUrl: "templates/quizzes_boundaries.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.quizzes_boundaries_results', {
		url: "/quizzes-boundaries-results",
		views: {
			'tab-quizzes': {
				templateUrl: "templates/quizzes_boundaries_results.html",
				controller: "UserController"
			}
		}
	})


	.state('menu.tabs.decisions', {
		url: "/decisions",
		views: {
			'tab-decisions': {
				templateUrl: "templates/decisions.html",
				controller: "UserController"
			}
		},
		resolve: {
			test: function () {
				console.log('menu.tabs.decisions');
			}
		}
	})

	.state('menu.tabs.decisions_create', {
		url: "/decisions-create",
		views: {
			'tab-decisions': {
				templateUrl: "templates/decisions_create.html",
				controller: "DecisionController"
			}
		},
		resolve: {
			decision: function () {
				console.log('menu.tabs.decisions_create.resolve');
				return {};
			}
		}
	})

	.state('menu.tabs.decisions_view', {
		url: "/decisions-view/:decision",
		views: {
			'tab-decisions': {
				templateUrl: "templates/decisions_view.html",
				controller: "DecisionController"
			}
		},
		resolve: {
			decision: function (UserService, $stateParams) {
				console.log('menu.tabs.decisions_view.resolve');
				return UserService.decision($stateParams.decision);
			}
		}

	})

	.state('menu.tabs.decisions_edit', {
		url: "/decisions-edit/:decision",
		views: {
			'tab-decisions': {
				templateUrl: "templates/decisions_create.html",
				controller: "DecisionController"
			}
		},
		resolve: {
			decision: function (UserService, $stateParams) {
				console.log('menu.tabs.decisions_edit.resolve');
				return UserService.decision($stateParams.decision);
			}
		}

	})

	.state('menu.tabs.decisions_revisit', {
		url: "/decisions-revisit",
		views: {
			'tab-decisions': {
				templateUrl: "templates/decisions_revisit.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.about', {
		url: "/about",
		views: {
			'tab-static': {
				templateUrl: "templates/about.html",
			}
		}
	})

	.state('menu.tabs.find_group', {
		url: "/find_group",
		views: {
			'tab-static': {
				templateUrl: "templates/find_group.html",
			}
		}
	})

	.state('menu.tabs.lead_group', {
		url: "/lead_group",
		views: {
			'tab-static': {
				templateUrl: "templates/lead_group.html",
			}
		}
	})

	.state('menu.tabs.resources', {
		url: "/resources",
		views: {
			'tab-static': {
				templateUrl: "templates/resources.html",
			}
		}
	})

	.state('menu.tabs.products', {
		url: "/products",
		views: {
			'tab-static': {
				templateUrl: "templates/products.html",
			}
		}
	})

	.state('menu.tabs.app_info', {
		url: "/app_info",
		views: {
			'tab-static': {
				templateUrl: "templates/app_info.html",
			}
		}
	})

	.state('menu.tabs.profile', {
		url: "/profile",
		cache: false,
		views: {
			'tab-static': {
				templateUrl: "templates/profile.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.link', {
		url: "/link",
		views: {
			'tab-static': {
				templateUrl: "templates/link.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.photo', {
		url: "/photo",
		views: {
			'tab-static': {
				templateUrl: "templates/photo.html",
				controller: "UserController"
			}
		}
	})

	.state('menu.tabs.notifications', {
		url: "/notifications",
		views: {
			'tab-static': {
				templateUrl: "templates/notifications.html",
			}
		}
	})

	.state('login', {
		url: "/login",
		templateUrl: "templates/login.html",
		controller: 'LoginController'
	})

	.state('signup', {
		url: "/signup",
		templateUrl: "templates/signup.html",
		controller: 'SignupController'
	})

	.state('forgot', {
		url: "/forgot",
		templateUrl: "templates/forgot.html",
		controller: 'ForgotController'
	})

	.state('terms', {
		url: "/terms",
		templateUrl: "templates/terms.html"
	})

	.state('privacy', {
		url: "/privacy",
		templateUrl: "templates/privacy.html"
	})

	$urlRouterProvider.otherwise('/menu/tabs/home');
})