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
				deferred.resolve(self.user);
			}
		});

		//		$location.path('/tab/home');
		//		$location.replace();

		return deferred.promise;
	}

	self.loginUser = function (user) {
		console.log('UserService.loginUser');
		var promise = $http.post(DOMAIN + '/ajax/users/login', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				response.data.data = $localStorage.toObj(response.data.User.json);
				if (response.data.Spouse.id) {
					response.data.spouse_data = $localStorage.toObj(response.data.Spouse.json);
				}
				self.updateUser(response.data).then(function () {
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
		var promise = $http.post(DOMAIN + '/ajax/users/facebook', fbuser)
			.success(function (response, status, headers, config) {

			if (response.status === 'SUCCESS') {
				response.data.data = $localStorage.toObj(response.data.User.json);
				if (response.data.Spouse.id) {
					response.data.spouse_data = $localStorage.toObj(response.data.Spouse.json);
				}
				self.updateUser(response.data).then(function () {
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
		var promise = $http.post(DOMAIN + '/ajax/users/register', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				self.updateUser(response.data).then(function () {
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

	self.linkUser = function (user) {
		console.log('UserService.linkUser');
		var promise = $http.post(DOMAIN + '/ajax/users/link', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
			case 'SUCCESS':
				console.log(['SUCCESS', response]);
				self.updateUser(response.data).then(function () {
					$state.go('menu.tabs.profile', {}, {reload:true});
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

	self.picUpload = function (FILE_URI) {
		console.log('UserService.picUpload');
		var deferred = $q.defer();
		var myImg = FILE_URI;
		var options = new FileUploadOptions();
		options.fileKey = "post";
		options.chunkedMode = false;
		var params = {};
		params.user_id = self.user.User.id;
		options.params = params;
		var ft = new FileTransfer();
		ft.upload(myImg, encodeURI(DOMAIN + '/ajax/users/upload'), function (success) {
			console.log('UserService.picUpload success: ' + success);
			self.user.User.picture = 1;
			self.updateUser(self.user).then(function (user) {
				deferred.resolve(self.user);
			})
		}, function (error) {
			console.log(['error', error]);
		}, options);
		return deferred.promise;
	}

	self.decision = function (decision_index) {
		console.log('UserService.decision');
		var deferred = $q.defer();
		setTimeout(function () {
			if (self.user == null) {
				console.log('null');
				$state.go('menu.tabs.decisions');
				deferred.reject();
			} else {
				var decision = self.user.data.decisions[decision_index];
				decision.index = decision_index;
				deferred.resolve(decision);
			}
		}, 0);
		return deferred.promise;
	}

	self.updateUser = function (user) {
		console.log('UserService.updateUser');
		var deferred = $q.defer();
		self.user = user;
		$localStorage.setObject('User', self.user);
		deferred.resolve(self.user);
		return deferred.promise;
	}

	self.syncUser = function (user) {
		console.log('UserService.syncUser');

		var promise = $http.post(DOMAIN + '/ajax/users/update', user)
			.success(function (response, status, headers, config) {
			switch (response.status) {
				case 'SUCCESS':
					if (response.data.Spouse.id) {
						response.data.spouse_data = $localStorage.toObj(response.data.Spouse.json);
					}
					self.updateUser(response.data);
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

	self.logout = function () {
		console.log('UserService.logout');
		self.user = null;
		$localStorage.remove('User');
		$state.go('login');
	}
})

.service('DecisionService', function($q, $http, $location, $localStorage, $state) {
	var self = this;
	
	self.add = function(decision, user) {
		console.log('DecisionService.add');
		decision.user_id = user.User.id;

		var promise = $http.post(DOMAIN + '/ajax/decisions/update', decision);

		return promise;
	}
	
	self.remove = function(decision) {
		console.log('DecisionService.remove');

		var promise = $http.post(DOMAIN + '/ajax/decisions/delete', decision);

		return promise;
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
})
	.service('ListService', function () {
	var self = this;
	self.giftList = [
		{
			model: 'teaching',
			name: 'TEACHING',
			desc: 'Communicates Information Well'
		},
		{
			model: 'wisdom',
			name: 'WISDOM',
			desc: 'Deep Insight Into Application Of Knowledge'
		},
		{
			model: 'knowledge',
			name: 'KNOWLEDGE',
			desc: 'Loves Information'
		},
		{
			model: 'exhortation',
			name: 'EXHORTATION',
			desc: 'Comforting And Encouraging'
		},
		{
			model: 'discernment',
			name: 'DISCERNMENT',
			desc: 'Easily Sees Truth'
		},
		{
			model: 'giving',
			name: 'GIVING',
			desc: 'Joyfully Contributes Time And Money'
		},
		{
			model: 'mercy',
			name: 'MERCY',
			desc: 'Great Compassion'
		},
		{
			model: 'evangelism',
			name: 'EVANGELISM',
			desc: 'Telling Others About Christ'
		},
		{
			model: 'hospitality',
			name: 'HOSPITALITY',
			desc: 'Provides A Warm Welcome'
		},
		{
			model: 'faith',
			name: 'FAITH',
			desc: 'Extraordinary Confidence In God'
		},
		{
			model: 'leadership',
			name: 'LEADERSHIP',
			desc: 'Sets And Achieves Goals For Groups With Ease'
		},
		{
			model: 'administration',
			name: 'ADMINISTRATION',
			desc: 'Creates And Executes Effective Plans'
		},
		{
			model: 'healing',
			name: 'HEALING',
			desc: 'Restores Health'
		},
		{
			model: 'tongues',
			name: 'TONGUES',
			desc: 'Speaking In Another Language'
		},
		{
			model: 'intercession',
			name: 'INTERCESSION',
			desc: 'Loves To Pray'
		},
		{
			model: 'service',
			name: 'SERVICE',
			desc: 'Identifies Need And Completes Tasks'
		},
	];

	self.painList = [
		'UNLOVED', 'UNWORTHY', 'INSIGNIFICANT', 'ALONE', 'WORTHLESS',
		'DEVALUED', 'DEFECTIVE', 'INADEQUATE', 'REJECTED', 'UNACCEPTABLE',
		'HOPELESS', 'UNWANTED', 'ABANDONED', 'UNAPPRECIATED', 'DISCOURAGED',
		'UNSAFE', 'INSECURE', 'UNSURE', 'USED', 'FEARFUL', 'POWERLESS', 'OUT OF CONTROL', 'CONTROLLED', 'VULNERABLE',
		'DISCONNECTED', 'UNKOWN', 'BETRAYED', 'INVALIDATED', 'UNABLE TO MEASURE UP',
	];

	self.copeList = [
		'BLAME OTHERS', 'DEPRESSED', 'CONTROLLING', 'ADDICTED',
		'RAGE', 'NEGATIVE', 'PERFECTIONISTIC', 'NUMBS OUT',
		'ANGRY', 'ANXIOUS', 'DEFENSIVE', 'IRRESPONSIBLE',
		'SARCASTIC', 'INCONSOLABLE', 'JUDGING', 'IMPULSIVE',
		'ARROGANT', 'CATASTROPHIZING', 'DEMANDING', 'AVOIDANT',
		'AGGRESSIVE', 'WHINE/NEEDY', 'CRITICAL', 'SECRETIVE',
		'DISCOURAGING', 'MANIPLUATES', 'NAGGING', 'DRAMATIC',
		'THREATENING', 'WITHDRAW TO POUT', 'INTELLECTUALIZING', 'SELFISH',
		'HOLD GRUDGES', 'ISOLOATE', 'PERFORMING', 'MINIMIZES',
		'RETALIATORY', 'SHAMES SELF', 'WITHDRAW TO DEFEND', 'ESCAPE',
		'WITHDRAW TO PUNISH', 'WITHDRAW TO AVOID'
	];

	self.truthList = [
		'LOVED', 'ACCEPTED', 'EMPOWERED', 'ENCOURAGED',
		'PRICELESS', 'PROMISING', 'VALUABLE', 'CONNECTED', 
		'TREASURED', 'SIGNIFICANT', 'KNOWN', 'CAN CONTROL SELF',
		'APPRECIATED', 'BELONGING', 'FULL OF WORTH', 'WANTED',
		'ADEQUATE', 'VALUED', 'CELEBRATED', 'SAFE'
	];

	self.actionList = [
		'ACCEPTING', 'NON-DEFENSIVE', 'ENERGETIC', 'NURTURING', 
		'VULNERABLE', 'HOPEFUL', 'SUPPORTIVE', 'COMMUNICATE CARE',
		'RESPECTFUL', 'ENCOURAGING', 'ENGAGING', 'OPEN', 
		'GIVING', 'PEACEFUL', 'INTIMATE', 'WELCOMING',
		'RELAXED', 'ABLE TO PERSIST', 'KIND', 'SETTLED',
		'RESPONSIBLE', 'GENTLE', 'SEEKING GOOD', 'TRUSTWORTHY', 
		'LISTENING', 'SELF VALUING', 'RELIABLY CONNECTED', 'LOVING',
		'MERCIFUL', 'HONEST', 'EMPATHETIC', 'SOBER', 
		'RELIABLE', 'HUMBLE', 'SELF-CONTROLLED', 
		'INCLUSIVE', 'POSITIVE',  
	];

	self.usnessQuiz = [
		{
			name: 'COMMUNICATION',
			option1: 'stormy seas',
			option2: 'bright, but choppy',
			option3: "smooth sailin'"
		},
		{
			name: 'DECISION MAKING',
			option1: 'striking out',
			option2: 'base hit',
			option3: 'home-runs'
		},
		{
			name: 'TIME TOGETHER',
			option1: 'warning light is on',
			option2: 'half a tank',
			option3: 'fully loaded'
		},
		{
			name: 'COMPANIONSHIP / FRIENDSHIP',
			option1: 'ships passing',
			option2: 'caravanning',
			option3: 'co-pilots'
		},
		{
			name: 'FINANCES',
			option1: "can't find the trailhead",
			option2: 'steady ascent',
			option3: 'at the peak'
		},
		{
			name: 'HOUSEWORK',
			option1: 'off key',
			option2: 'band practice',
			option3: 'welcome to Hollywood'
		},
		{
			name: 'IN-LAWS',
			option1: 'parted like the Red Sea',
			option2: 'freeway merge',
			option3: 'united we stand'
		},
		{
			name: 'ROMANCE / INTIMACY',
			option1: 'two left feet',
			option2: "we're at the dance, we hear the music",
			option3: 'dancing the night away'
		},
		{
			name: 'DREAMING / PLANNING',
			option1: 'in the dark',
			option2: 'partly cloudy',
			option3: "future's so bright..."
		},
		{
			name: 'CHILDREN (if applicable)',
			option1: 'bronze medal',
			option2: 'silver medal',
			option3: 'taking home the gold'
		},
	];

	self.boundariesQuiz = [
		{
			name: 'SPENDING MONEY',
			option1: "Little-to-no spontaneous spending",
			option2: "Who needs a budget?",
			option3: "Planned out, with room to flex"
		},
		{
			name: 'GIVING MONEY',
			option1: "10% all the time",
			option2: "Give in the emotion of the ask",
			option3: "Open and responsible giving"
		},
		{
			name: 'SOCIALIZING',
			option1: "Scheduled, limiting",
			option2: "Spur-of-the-moment, unrestricted",
			option3: "Sometimes yes, sometimes no"
		},
		{
			name: 'HELPING OTHERS',
			option1: "No unplanned assistance",
			option2: "Give beyond our own resources",
			option3: "Accessible and balanced"
		},
		{
			name: 'MINISTRY / CHURCH OPPORTUNITIES',
			option1: "Rarely say yes",
			option2: "Rarely say no",
			option3: "Based on prayerful consideration"
		},
		{
			name: 'WORK',
			option1: "Priority number one",
			option2: "Last on the list of concerns",
			option3: "Responsible and flexible"
		},
		{
			name: 'EXTENDED FAMILY',
			option1: "Only scheduled gatherings",
			option2: "Come running whenever they call",
			option3: "Based on their needs and our needs "
		},
		{
			name: 'HOBBIES / PERSONAL INTERESTS',
			option1: "Not seen as practical or valuable",
			option2: "Easily absorbed",
			option3: "Connected, but not attached at the hip"
		},
		{
			name: 'INTERNET / TV / ENTERTAINMENT',
			option1: "Waste of time",
			option2: "Never unplug",
			option3: "Balancing the 'on' and 'off' switch"
		},
		{
			name: "CHILDRENS' ACTIVITIES (IF APPLICABLE)",
			option1: "Homebodies",
			option2: "Running everywhere to everything",
			option3: "Intentional engagement"
		},
	]
});