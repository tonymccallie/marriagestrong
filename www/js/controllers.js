angular.module('greyback.controllers', [])

.controller('AppController', function ($scope, $sce, $ionicDeploy, $ionicActionSheet, $location, $ionicPlatform, $ionicUser, $ionicPush, $state, $ionicSideMenuDelegate, $cordovaFile, $cordovaCapture, UserService, user) {
	console.log('AppController');
	//app wide variables
	$scope.DOMAIN = DOMAIN;
	$scope.imageDir = DOMAIN + '/img/thumb/';
	$scope.logs = [];
	$scope.user = user;
	$scope.loginUser = {};
	$scope.signupUser = {};

	$scope.log = function (obj) {
		$scope.logs.push(moment().format('h:mm:ss') + ': ' + obj);
	}
	
	$scope.urlForImage = function(imageName) {
		if(typeof cordova !== 'undefined') {
			var trueOrigin = cordova.file.dataDirectory + imageName;
		} else {
			var trueOrigin = 'img/upload-photo.jpg';
		}
		return trueOrigin;
	}

	$ionicPlatform.ready(function () {
		//DEPLOY
		//$scope.log('Ionic Deploy: Checking for updates');
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


		//PUSH
		var ionicUser = $ionicUser.get();
		if (!$scope.user.User.push_id) {
			$scope.user.User.push_id = $ionicUser.generateGUID();
		}

		angular.extend(ionicUser, {
			email: $scope.user.User.email,
			user_id: $scope.user.User.push_id
		});

		UserService.syncUser($scope.user).then(function (data) {
			$ionicUser.identify(ionicUser).then(function () {
				$ionicPush.register({
					canShowAlert: true, //Can pushes show an alert on your screen?
					canSetBadge: true, //Can pushes update app icon badges?
					canPlaySound: true, //Can notifications play a sound?
					canRunActionsOnWake: true, //Can run actions outside the app,
					onNotification: function (notification) {
						// Handle new push notifications here
						// console.log(notification);
						return true;
					}
				});
			});
		});
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
	$scope.loginUser = {};

	$scope.login = function (form) {
		console.log(['LoginController.login', $scope.loginUser]);
		if (form.$valid) {
			UserService.loginUser($scope.loginUser).then(function (data) {
				$scope.loginUser = {};
			});
		}
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
	$scope.signupUser = {};

	$scope.signup = function (form) {
		console.log('SignupController.signup');
		if (form.$valid) {
			UserService.createUser($scope.signupUser).then(function (data) {
				$scope.signupUser = {};
			});
		}
	}
})

.controller('ForgotController', function ($scope, ngFB) {
	console.log('ForgotController');
})

.controller('HomeController', function ($scope, $q, $ionicModal, $timeout, $ionicSlideBoxDelegate, ImgCache, PtrService, ngFB, user) {
	console.log(['HomeController',user]);
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	// Form data for the login modal
	$scope.loginData = {};

	//FACEBOOK API REFERENCE
	//	ngFB.api({
	//		path: '/me',
	//		params: {
	//			fields: 'id,name'
	//		}
	//	}).then(function (user) {
	//		$scope.user = user;
	//	}, function (error) {
	//		alert('Facebook error: ' + error.error_description);
	//	});

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
		//		var headersPromise = NewsService.update('headers');
		//		var newsPromise = NewsService.update('articles');
		//
		//
		//		$q.all([headersPromise, newsPromise]).then(function (data) {
		//			console.log(data);
		//			$scope.headers = data[0];
		//			$scope.articles = data[1];
		//			$scope.$broadcast('scroll.refreshComplete');
		//			setTimeout(function () {
		//				$ionicSlideBoxDelegate.update();
		//			}, 0);
		//		});
	}

	$scope.$on("$ionicView.loaded", function () {
		//console.log("View loaded! Triggering PTR");
		//PtrService.triggerPtr('home_pull');
	});
})

.controller('UserController', function ($scope, $q, $ionicModal, $timeout, $ionicHistory, $ionicLoading, $state, ImgCache, PtrService, ngFB, user, UserService, ListService) {
	console.log('UserController');
	$scope.link_code = "";
	$scope.user = user;
	//$scope.user.data.decisions = [];
	//console.warn(['UserController',$scope.user.data.decisions]);
	//$scope.user.data = {};

	var countBool = function (obj) {
		var count = 0;
		for (var key in obj) {
			if (obj[key]) {
				count++;
			}
		}
		return count;
	}

	var sumObj = function (obj) {
		var count = 0;
		for (var key in obj) {
			count += parseInt(obj[key]);
		}
		return count;
	}

	$scope.$on('$ionicView.enter', function (e) {
		console.log('State: ' + $state.current.name);
		switch ($state.current.name) {
		case 'menu.tabs.usness_gifts':
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.usness != 'undefined') && ((typeof $scope.user.data.usness.gifts != 'undefined') || (typeof $scope.user.data.usness.gifts_other != 'undefined'))) {
				if (typeof $scope.user.data.usness.gifts != 'undefined') {
					$scope.giftCount += countBool($scope.user.data.usness.gifts);
				}
				if (typeof $scope.user.data.usness.gifts_other != 'undefined') {
					$scope.giftCount += countBool($scope.user.data.usness.gifts_other);
				}
			}
			break;
		case 'menu.tabs.cycles_pain':
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.usness != 'undefined') && (typeof $scope.user.data.usness.pains != 'undefined')) {
				$scope.painCount += countBool($scope.user.data.usness.pains);
			}
			break;
		case 'menu.tabs.cycles_pain_copes':
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.usness != 'undefined') && (typeof $scope.user.data.usness.copes != 'undefined')) {
				$scope.copeCount += countBool($scope.user.data.usness.copes);
			}
			break;
		case 'menu.tabs.cycles_peace':
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.usness != 'undefined') && (typeof $scope.user.data.usness.truths != 'undefined')) {
				$scope.truthCount += countBool($scope.user.data.usness.truths);
			}
			break;
		case 'menu.tabs.cycles_peace_response':
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.usness != 'undefined') && (typeof $scope.user.data.usness.actions != 'undefined')) {
				$scope.actionCount += countBool($scope.user.data.usness.actions);
			}
			break;
		case 'menu.tabs.quizzes_usness_results':
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.quizzes != 'undefined') && (typeof $scope.user.data.quizzes.usness != 'undefined')) {
				$scope.usnessQuizTotal = sumObj($scope.user.data.quizzes.usness);
			} else {
				$scope.usnessQuizTotal = 0;
			}
			break;
		case 'menu.tabs.quizzes_boundaries_results':
			$scope.boundariesQuizTotal = {
				1: 0,
				2: 0,
				3: 0
			};
			if ((typeof $scope.user.data != 'undefined') && (typeof $scope.user.data.quizzes != 'undefined') && (typeof $scope.user.data.quizzes.boundaries != 'undefined')) {
				for (var key in $scope.user.data.quizzes.boundaries) {
					$scope.boundariesQuizTotal[$scope.user.data.quizzes.boundaries[key]]++;
				}
				$scope.boundariesValue = 0;
				var highestCount = 0;
				for (var valKey in $scope.boundariesQuizTotal) {
					if (parseInt($scope.boundariesQuizTotal[valKey]) >= highestCount) {
						highestCount = parseInt($scope.boundariesQuizTotal[valKey]);
						$scope.boundariesValue = valKey;
					}
				}

			}
			break;
		}
	});

	$scope.anniversaryDatePicker = {		
//		titleLabel: 'Title', //Optional
//		todayLabel: 'Today', //Optional
//		closeLabel: 'Close', //Optional
//		setLabel: 'Set', //Optional
//		setButtonType: 'button-assertive', //Optional
//		todayButtonType: 'button-assertive', //Optional
//		closeButtonType: 'button-assertive', //Optional
//		inputDate: new Date(), //Optional
//		mondayFirst: true, //Optional
//		disabledDates: disabledDates, //Optional
//		weekDaysList: weekDaysList, //Optional
//		monthList: monthList, //Optional
//		templateType: 'popup', //Optional
//		modalHeaderColor: 'bar-positive', //Optional
//		modalFooterColor: 'bar-positive', //Optional
//		from: new Date(2012, 8, 2), //Optional
//		to: new Date(2018, 8, 25), //Optional
		callback: function (val) { //Mandatory
			if (typeof $scope.user.User == 'undefined') {
				$scope.user.User = {};
			}
			$scope.user.User.anniversary = val;
		}
	};

	$scope.firstdateDatePicker = {
		//titleLabel: 'Title', //Optional
		//todayLabel: 'Today', //Optional
		//closeLabel: 'Close', //Optional
		//setLabel: 'Set', //Optional
		//errorMsgLabel: 'Please select time.', //Optional
		//setButtonType: 'button-assertive', //Optional
		inputDate: new Date(), //Optional
		//mondayFirst: false, //Optional
		//disabledDates: disabledDates, //Optional
		//monthList: monthList, //Optional
		//from: new Date(2015, 7, 2), //Optional
		//to: new Date(2015, 7, 29), //Optional
		callback: function (val) { //Mandatory
			if (typeof $scope.user.User == 'undefined') {
				$scope.user.User = {};
			}
			$scope.user.User.first_date = val;
		}
	};

	$scope.test_link = function() {
		console.log('test_link');
		UserService.syncUser($scope.user).then(function(user) {
			UserService.checkUser().then(function(user) {
				console.log(user);
				$scope.user = user;
				if($scope.user.Spouse.id) {
					alert('You have successfully linked accounts.');
					$ionicHistory.clearCache()
					$state.transitionTo('menu.tabs.profile', {}, {
						reload: true,
						inherit: false,
						notify: true
					});
				} else {
					alert('The accounts are not linked yet.');
				}
			})
		});
	}
	
	$scope.share = function (code) {
		console.log(code);
		window.plugins.socialsharing.shareViaSMS('My MarriageStrong code: ' + code, null, function (msg) {
			console.log(['ok', msg]);
		}, function (msg) {
			console.log(['err', msg]);
		});
	}

	$scope.getPic = function (type) {
		console.log(['getPic',type]);
		var options = {
			quality: 50,
			destinationType: Camera.DestinationType.FILE_URI,
			correctOrientation: true,
			allowEdit: true,
			targetWidth: 600,
			targetHeight: 600,
			sourceType: type, // 0:Photo Library, 1=Camera, 2=Saved Photo Album
			encodingType: 0 // 0=JPG 1=PNG
		}
		navigator.camera.getPicture(picSuccess, picFail, options);
	}

	var picSuccess = function (FILE_URI) {
		console.log(['picSuccess',FILE_URI]);
		
		UserService.picSave(FILE_URI).then(function (user) {
			$scope.user = user;
			$state.go('menu.tabs.profile', {}, {
				reload: true,
				inherit: false,
				notify: true
			});
		});
	}

	var picFail = function () {

	}

	$scope.linkUser = {};
	$scope.link = function (form) {
		console.log('UserController: link');
		if (form.$valid) {
			$scope.linkUser.user_id = $scope.user.User.id;
			UserService.linkUser($scope.linkUser).then(function (response) {
				console.log(['UserController.link', response]);
				if (response.data.status == 'SUCCESS') {
					UserService.checkUser().then(function(user) {
						$scope.user = user;
						$ionicHistory.clearCache()
						$state.transitionTo('menu.tabs.profile', {}, {
							reload: true,
							inherit: false,
							notify: true
						});
					});
					
				}
			});
		}
	}

	$scope.process = function (next, form) {
		var boolPass = true;
		if (form.$name == 'usnessGiftsForm' && $scope.giftCount < 1) {
			boolPass = false;
			alert('You much choose at least one gift.');
		}

		if (form.$name == 'cyclesPainForm' && $scope.painCount < 1) {
			boolPass = false;
			alert('You much choose at least one feeling.');
		}

		if (form.$name == 'cyclesPainCopesForm' && $scope.copeCount < 1) {
			boolPass = false;
			alert('You much choose at least one cope.');
		}

		if (form.$name == 'cyclesPeaceForm' && $scope.truthCount < 1) {
			boolPass = false;
			alert('You much choose at least one truth.');
		}

		if (form.$name == 'cyclesPeaceResponseForm' && $scope.actionCount < 1) {
			boolPass = false;
			alert('You much choose at least one action.');
		}

		if (boolPass) {
			$scope.user.data[form.$name] = true;
			if (form.$name == 'cyclesPeaceResponseForm') {
				$scope.user.data.peace = true;
			}
			if (form.$name == 'cyclesPainCopesForm') {
				$scope.user.data.pain = true;
			}
			$ionicLoading.show({
				template: 'Syncing Results<br /><ion-spinner></ion-spinner>'
			});
			UserService.syncUser($scope.user).then(function (data) {
				$ionicLoading.hide();
				console.log($scope.user);
			});
			$state.go(next);
		}
	}

	$scope.giftList = ListService.giftList;

	$scope.giftCount = 0;

	$scope.checkGifts = function (item) {
		if (item) {
			$scope.giftCount++;
		} else {
			$scope.giftCount--;
		}
	}

	$scope.giftVars = {
		other1: false,
		other2: false,
		other3: false
	};

	$scope.checkGiftOther = function (item, varName) {
		if (!$scope.giftVars[varName] && item.length > 0) {
			$scope.giftVars[varName] = true;
			$scope.giftCount++;
		}
		if ($scope.giftVars[varName] && item.length == 0) {
			$scope.giftVars[varName] = false;
			$scope.giftCount--;
		}
	}

	$scope.painList = ListService.painList;

	$scope.painCount = 0;

	$scope.checkPains = function (item) {
		if (item) {
			$scope.painCount++;
		} else {
			$scope.painCount--;
		}
	}

	$scope.painVars = {
		other1: false,
		other2: false,
		other3: false
	};

	$scope.checkPainsOther = function (item, varName) {
		if (!$scope.painVars[varName] && item.length > 0) {
			$scope.painVars[varName] = true;
			$scope.painCount++;
		}
		if ($scope.painVars[varName] && item.length == 0) {
			$scope.painVars[varName] = false;
			$scope.painCount--;
		}
	}

	$scope.copeList = ListService.copeList;

	$scope.copeCount = 0;

	$scope.checkCopes = function (item) {
		if (item) {
			$scope.copeCount++;
		} else {
			$scope.copeCount--;
		}
	}

	$scope.copeVars = {
		other1: false,
		other2: false,
		other3: false
	};

	$scope.checkCopesOther = function (item, varName) {
		if (!$scope.copeVars[varName] && item.length > 0) {
			$scope.copeVars[varName] = true;
			$scope.copeCount++;
		}
		if ($scope.copeVars[varName] && item.length == 0) {
			$scope.copeVars[varName] = false;
			$scope.copeCount--;
		}
	}

	$scope.truthList = ListService.truthList;

	$scope.truthCount = 0;

	$scope.checkTruths = function (item) {
		if (item) {
			$scope.truthCount++;
		} else {
			$scope.truthCount--;
		}
	}

	$scope.truthVars = {
		other1: false,
		other2: false,
		other3: false
	};

	$scope.checkTruthsOther = function (item, varName) {
		if (!$scope.truthVars[varName] && item.length > 0) {
			$scope.truthVars[varName] = true;
			$scope.truthCount++;
		}
		if ($scope.truthVars[varName] && item.length == 0) {
			$scope.truthVars[varName] = false;
			$scope.truthCount--;
		}
	}

	$scope.actionList = ListService.actionList;

	$scope.actionCount = 0;

	$scope.checkActions = function (item) {
		if (item) {
			$scope.actionCount++;
		} else {
			$scope.actionCount--;
		}
	}

	$scope.actionVars = {
		other1: false,
		other2: false,
		other3: false
	};

	$scope.checkActionsOther = function (item, varName) {
		if (!$scope.actionVars[varName] && item.length > 0) {
			$scope.actionVars[varName] = true;
			$scope.actionCount++;
		}
		if ($scope.actionVars[varName] && item.length == 0) {
			$scope.actionVars[varName] = false;
			$scope.actionCount--;
		}
	}

	$scope.usnessQuestions = ListService.usnessQuiz;

	$scope.usnessQuizTotal = 0;

	$scope.boundariesQuestions = ListService.boundariesQuiz;

	$scope.boundariesQuizTotal = {
		1: 0,
		2: 0,
		3: 0
	};
	$scope.boundariesValue = 0;

	$scope.yourPain = function () {
		if (!$scope.user.data.pain) {
			$state.go('menu.tabs.cycles_pain');
		} else {
			$state.go('menu.tabs.cycles_pain_results');
		}
	}

	$scope.yourPeace = function () {
		if (!$scope.user.data.peace) {
			$state.go('menu.tabs.cycles_peace');
		} else {
			$state.go('menu.tabs.cycles_results');
		}
	}
})

.controller('DecisionController', function ($scope, $q, $ionicModal, $timeout, $ionicHistory, $state, ImgCache, PtrService, ngFB, user, decision, UserService, DecisionService) {
	console.log('DecisionController');
	$scope.decision = decision;

	$scope.reminderDatePicker = {
		//titleLabel: 'Title', //Optional
		//todayLabel: 'Today', //Optional
		//closeLabel: 'Close', //Optional
		//setLabel: 'Set', //Optional
		//errorMsgLabel: 'Please select time.', //Optional
		//setButtonType: 'button-assertive', //Optional
		//inputDate: new Date(), //Optional
		//mondayFirst: false, //Optional
		//disabledDates: disabledDates, //Optional
		//monthList: monthList, //Optional
		//from: new Date(2015, 7, 2), //Optional
		//to: new Date(2015, 7, 29), //Optional
		callback: function (val) { //Mandatory
			if (typeof $scope.user.data == 'undefined') {
				$scope.user.data = {};
			}
			$scope.decision.reminder = val;
		}
	};

	$scope.save = function (form) {
		console.log('DecisionController.save');
		if (typeof $scope.user.data == 'undefined') {
			$scope.user.data = {};
		}

		if (typeof $scope.user.data.decisions == 'undefined') {
			$scope.user.data.decisions = [];
		}

		DecisionService.add($scope.decision, $scope.user).success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				$scope.decision.id = response.id;
				$scope.decision.user_id = $scope.user.User.id;
				if (typeof $scope.decision.index == 'undefined') {
					$scope.user.data.decisions.push(decision);
				} else {
					$scope.user.data.decisions[$scope.decision.index] = (decision);
				}
				UserService.updateUser($scope.user);
				$state.go('menu.tabs.decisions');
				$scope.decision = {};
				break;
			case 'MESSAGE':
				alert(response.data);
				break;
			default:
				alert('there was a server error for Messages');
				console.log(response);
				break;
			}
		}).error(function (response, status, headers, config) {
			console.log(['error', status, headers, config]);
		});
	}

	$scope.remove = function (decision_index) {
		DecisionService.remove($scope.user.data.decisions[decision_index]).success(function (response) {
			switch (response.status) {
			case 'SUCCESS':
				$scope.user.data.decisions.splice(decision_index, 1);
				UserService.updateUser($scope.user);
				$state.go('menu.tabs.decisions_revisit');
				break;
			case 'MESSAGE':
				alert(response.data);
				break;
			default:
				alert('there was a server error for Messages');
				console.log(response);
				break;

			}
		});
	}
})