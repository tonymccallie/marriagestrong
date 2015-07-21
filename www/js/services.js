angular.module('greyback.services', [])

.service('UserService', function($q, $http, $location, $localStorage, $state) {
	var self = this;
	self.user = {};
	
	self.local = function ($category) {
		console.log('UserService.local ' + $category);
		var deferred = $q.defer();
		var localUser = $localStorage.getObject('User');
		deferred.resolve(localUser);
		return deferred.promise;
	}
	
	self.init = function() {
		console.log('UserService.init');
		var deferred = $q.defer();
		self.local().then(function (storedUser) {
			if (storedUser) {
				console.log('UserService: need to login');
				$state.go('login');
			} else {
				console.log('UserService: use local');
				self.user = storedUser;
				deferred.resolve(self.user);
			}
		});

		//		$location.path('/tab/home');
		//		$location.replace();

		return deferred.promise;
	}
	
	self.checkUser = function() {
		console.log('UserService.checkUser');
		var deferred = $q.defer();
		if (self.user) {
			console.log('UserService: no user');
			self.init().then(function (initUser) {
				deferred.resolve(self.user);
			});
		} else {
			console.log('UserService: had user');
			deferred.resolve(self.user);
		}
		$ionicSlideBoxDelegate.update();
		return deferred.promise;
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