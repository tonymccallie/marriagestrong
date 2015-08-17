angular.module('greyback.services', [])

.service('UserService', function ($q, $http, $location, $localStorage, $state) {
	var self = this;
	self.user = null;
	
	var steps = [
		{
			title: "US-ness",
			url: "menu.tabs.usness"
		},
	];

	self.local = function ($category) {
		console.log('UserService.local');
		var deferred = $q.defer();
		var localUser = $localStorage.getObject('User');
		deferred.resolve(localUser);
		return deferred.promise;
	}

	self.init = function () {
		console.log('UserService.init');
		var deferred = $q.defer();
		self.local().then(function (storedUser) {
			if (typeof storedUser.User === 'undefined') {
				console.log('UserService.init: need to login');
				//HIDE FOR DEV
				$state.go('login');
				deferred.resolve(self.user);
			} else {
				console.log('UserService.init: use local');
				self.user = storedUser;
				console.log(self.user);
				deferred.resolve(self.user);
			}
		});

		//		$location.path('/tab/home');
		//		$location.replace();

		return deferred.promise;
	}

	self.loginUser = function (user) {
		console.log('UserService.loginUser');
		var promise = $http.post(DOMAIN + '/users/ajax_login', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				self.updateUser(response.data).then(function() {
					$state.go('menu.tabs.home');
				});
				break;
			case 'MESSAGE':
				alert(response.data);
				$state.go('login');
				break;
			default:
				alert('there was a server error for Messages');
				console.log(response);
				break;
			}
		})
			.error(function (response, status, headers, config) {
			console.log(['error', status, headers, config]);
		});
		return promise;
	}

	self.saveFacebook = function (fbuser) {
		console.log('UserService.saveFacebook')
		var promise = $http.post(DOMAIN + '/users/ajax_facebook', fbuser)
			.success(function (response, status, headers, config) {

			if (response.status === 'SUCCESS') {
				self.updateUser(response.data).then(function() {
					$state.go('menu.tabs.home');
				});
			} else {
				alert('there was a server error for Messages');
				console.log(response);
			}
		})
			.error(function (response, status, headers, config) {
			console.log(['error', status, headers, config]);
		});
		return promise;
	}

	self.checkUser = function () {
		console.log('UserService.checkUser');
		var deferred = $q.defer();
		if (!self.user) {
			console.log('UserService.checkUser: no user');
			self.init().then(function (initUser) {
				deferred.resolve(self.user);
			});
		} else {
			console.log('UserService.checkUser: had user');
			deferred.resolve(self.user);
		}
		return deferred.promise;
	}

	self.createUser = function (user) {
		console.log('UserService.createUser');
		var promise = $http.post(DOMAIN + '/users/ajax_register', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				self.updateUser(response.data).then(function() {
					$state.go('menu.tabs.home');
				});
				break;
			case 'MESSAGE':
				alert(response.data);
				$state.go('login');
				break;
			default:
				alert('there was a server error for Messages');
				console.log(response);
				break;
			}
		})
			.error(function (response, status, headers, config) {
			console.log(['error', status, headers, config]);
		});
		return promise;
	}
	
	self.linkUser = function(user) {
		console.log('UserService.linkUser');
		var promise = $http.post(DOMAIN + '/users/ajax_link', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				console.log(['SUCCESS',response]);
				self.updateUser(response.data).then(function() {
					//$state.go('menu.tabs.profile');
				});
				break;
			case 'MESSAGE':
				alert(response.data);
				break;
			default:
				alert('there was a server error for Messages');
				console.log(response);
				break;
			}
		})
			.error(function (response, status, headers, config) {
			console.log(['error', status, headers, config]);
		});
		return promise;
	}
	
	self.picUpload = function(FILE_URI) {
		console.log('UserService.picUpload');
		var deferred = $q.defer();
		var myImg = FILE_URI;
        var options = new FileUploadOptions();
        options.fileKey="post";
        options.chunkedMode = false;
        var params = {};
		params.user_id = self.user.User.id;
        options.params = params;
        var ft = new FileTransfer();
        ft.upload(myImg, encodeURI(DOMAIN + '/users/ajax_upload'), function(success) {
			console.log('UserService.picUpload success: '+ success);
			self.user.User.picture = 1;
			self.updateUser(self.user).then(function(user) {
				deferred.resolve(self.user);
			})
		}, function(error) {
			console.log(['error',error]);
		}, options);
		return deferred.promise;
	}
	
	self.updateUser = function(user) {
		console.log('UserService.updateUser');
		var deferred = $q.defer();
		self.user = user;
		$localStorage.setObject('User', self.user);
		deferred.resolve(self.user);
		return deferred.promise;
	}

	self.logout = function () {
		console.log('UserService.logout');
		self.user = null;
		$localStorage.remove('User');
		$state.go('login');
	}
})

.service('PtrService', function ($timeout, $ionicScrollDelegate) {
	/**
	 * Trigger the pull-to-refresh on a specific scroll view delegate handle.
	 * @param {string} delegateHandle - The `delegate-handle` assigned to the `ion-content` in the view.
	 */
	this.triggerPtr = function (delegateHandle) {

		$timeout(function () {

			var scrollView = $ionicScrollDelegate.$getByHandle(delegateHandle).getScrollView();

			if (!scrollView) return;

			scrollView.__publish(
				scrollView.__scrollLeft, -scrollView.__refreshHeight,
				scrollView.__zoomLevel, true);

			var d = new Date();

			scrollView.refreshStartTime = d.getTime();

			scrollView.__refreshActive = true;
			scrollView.__refreshHidden = false;
			if (scrollView.__refreshShow) {
				scrollView.__refreshShow();
			}
			if (scrollView.__refreshActivate) {
				scrollView.__refreshActivate();
			}
			if (scrollView.__refreshStart) {
				scrollView.__refreshStart();
			}

		});

	}
});