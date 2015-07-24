angular.module('greyback.controllers', [])

.controller('AppController', function ($scope, $sce, $ionicDeploy, $ionicActionSheet, $location, $ionicPlatform, $state, $ionicSideMenuDelegate, UserService) {
	console.log('AppController');
	//app wide variables
	$scope.DOMAIN = DOMAIN;
	$scope.imageDir = DOMAIN + '/img/thumb/';
	$scope.logs = [];
	$scope.user = {};
	$scope.log = function (obj) {
		$scope.logs.push(moment().format('h:mm:ss') + ': ' + obj);
	}

	$ionicPlatform.ready(function () {
		$scope.log('Ionic Deploy: Checking for updates');
		//		$ionicDeploy.check().then(function (hasUpdate) {
		//			$scope.log('Ionic Deploy: Update available: ' + hasUpdate);
		//			$scope.hasUpdate = hasUpdate;
		//			if(hasUpdate) {
		//				$ionicActionSheet.show({
		//					titleText: 'There is an update available',
		//					buttons: [
		//						{ text: 'Update Now' }
		//					],
		//					buttonClicked: function(index) {
		//						$location.path('/menu/tabs/settings');
		//					},
		//					cancelText: 'Later',
		//					cancel: function() {
		//						return true;
		//					}
		//				});
		//			}
		//		}, function (err) {
		//			$scope.log('Ionic Deploy: Unable to check for updates', err);
		//		});

	});

	$scope.trust = function (snippet) {
		return $sce.trustAsHtml(snippet);
	};

	$scope.logout = function () {
		$scope.user = {};
		UserService.logout();
	}
})

.controller('LoginController', function ($scope, ngFB, UserService) {
	console.log('LoginController');

	$scope.login = function (data) {
		console.log(data);
	}

	$scope.fblogin = function () {
		console.log('LoginController.fblogin');
		ngFB.login({
			scope: 'email,public_profile'
		}).then(function (response) {
			if (response.status === 'connected') {
				console.log(['Facebook login succeeded', response]);
				ngFB.api({
					path: '/me',
					params: {
						fields: 'id,email,first_name,last_name'
					}
				}).then(function (user) {
					UserService.saveFacebook(user).then(function (user) {
						$scope.user = user;
					});
					//MAKE AN APP USER
					//$scope.user = user;
				}, function (error) {
					alert('Facebook error: ' + error.error_description);
				});
			} else {
				alert('Facebook login failed');
			}
		});
	}

	$scope.fblogout = function () {
		console.log('fblogout');
		ngFB.logout().then(function (response) {
			console.log('logout');
		});
	}
})

.controller('SignupController', function ($scope, UserService) {
	console.log('SignupController');
	$scope.User = {};

	$scope.signup = function (form) {
		if (form.$valid) {
			UserService.createUser($scope.User).then(function (data) {

			});
		}
	}
})

.controller('ForgotController', function ($scope, ngFB) {
	console.log('ForgotController');
})

.controller('HomeController', function ($scope, $q, $ionicModal, $timeout, $ionicSlideBoxDelegate, ImgCache, PtrService, ngFB) {
	console.log('HomeController');
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	// Form data for the login modal
	$scope.loginData = {};

	ngFB.api({
		path: '/me',
		params: {
			fields: 'id,name'
		}
	}).then(function (user) {
		$scope.user = user;
	}, function (error) {
		alert('Facebook error: ' + error.error_description);
	});

	// Create the login modal that we will use later
	$ionicModal.fromTemplateUrl('templates/login.html', {
		scope: $scope
	}).then(function (modal) {
		$scope.modal = modal;
	});

	// Triggered in the login modal to close it
	$scope.closeLogin = function () {
		$scope.modal.hide();
	};

	// Open the login modal
	$scope.login = function () {
		$scope.modal.show();
	};

	// Perform the login action when the user submits the login form
	$scope.doLogin = function () {
		$scope.log('Doing login', $scope.loginData);

		// Simulate a login delay. Remove this and replace with your login
		// code if using a login system
		$timeout(function () {
			$scope.closeLogin();
		}, 1000);
	};

	$scope.update = function () {
		console.log('HomeController.update');
		var headersPromise = NewsService.update('headers');
		var newsPromise = NewsService.update('articles');

		//		newsPromise.then(function(data) {
		//			$scope.articles = data;
		//			$scope.$broadcast('scroll.refreshComplete');
		//		});

		$q.all([headersPromise, newsPromise]).then(function (data) {
			console.log(data);
			$scope.headers = data[0];
			$scope.articles = data[1];
			$scope.$broadcast('scroll.refreshComplete');
			setTimeout(function () {
				$ionicSlideBoxDelegate.update();
			}, 0);
		});
	}

	$scope.$on("$ionicView.loaded", function () {
		//console.log("View loaded! Triggering PTR");
		//PtrService.triggerPtr('home_pull');
	});
})