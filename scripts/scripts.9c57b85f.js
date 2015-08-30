'use strict';

/**
 * @ngdoc overview
 * @name accessopolisApp
 * @description
 * # accessopolisApp
 *
 * Main module of the application.
 */
angular.module('accessopolisApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'firebase.ref',
    'firebase.auth',
    'accessopolis.navigation',
    'accessopolis.search',
    'accessopolis.locationDetail',
    'accessopolis.rating'
  ])
    .controller('AppCtrl', ["$scope", "Auth", function ($scope, Auth) {
        $scope.user = Auth.$getAuth();
    }]);

'use strict';

/**
 * @ngdoc function
 * @name accessopolisApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the accessopolisApp
 */
angular.module('accessopolisApp')
  .controller('MainCtrl', ["$scope", function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);

angular.module('firebase.config', [])
  .constant('FBURL', 'https://accessopolis.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['google'])

  .constant('loginRedirectPath', '/login');

angular.module('firebase.ref', ['firebase', 'firebase.config'])
  .factory('Ref', ['$window', 'FBURL', function($window, FBURL) {
    'use strict';
    return new $window.Firebase(FBURL);
  }]);

'use strict';
/**
 * @ngdoc function
 * @name accessopolisApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */
angular.module('accessopolisApp')
  .controller('ChatCtrl', ["$scope", "Ref", "$firebaseArray", "$timeout", function ($scope, Ref, $firebaseArray, $timeout) {
    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    $scope.messages = $firebaseArray(Ref.child('messages').limitToLast(10));

    // display any errors
    $scope.messages.$loaded().catch(alert);

    // provide a method for adding a message
    $scope.addMessage = function(newMessage) {
      if( newMessage ) {
        // push a message to the end of the array
        $scope.messages.$add({text: newMessage})
          // display any errors
          .catch(alert);
      }
    };

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }
  }]);

'use strict';

angular.module('accessopolisApp')
  .filter('reverse', function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  });

(function() {
  'use strict';
  angular.module('firebase.auth', ['firebase', 'firebase.ref'])

    .factory('Auth', ["$firebaseAuth", "Ref", function($firebaseAuth, Ref) {
      return $firebaseAuth(Ref);
    }]);
})();

'use strict';
/**
 * @ngdoc function
 * @name accessopolisApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('accessopolisApp')
  .controller('LoginCtrl', ["$scope", "Auth", "$location", function ($scope, Auth, $location) {
    $scope.oauthLogin = function(provider) {
      $scope.err = null;
      Auth.$authWithOAuthPopup(provider, { scope: 'email' }).then(redirect, showError);

    };

    $scope.anonymousLogin = function() {
      $scope.err = null;
      Auth.$authAnonymously({rememberMe: true}).then(redirect, showError);
    };



    function redirect() {
      $location.path('/account');
    }

    function showError(err) {
      $scope.err = err;
    }


  }]);

'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('accessopolisApp')
  .controller('AccountCtrl', ["$scope", "user", "Auth", "Ref", "$firebaseObject", "$timeout", function ($scope, user, Auth, Ref, $firebaseObject, $timeout) {
    $scope.user = user;
    $scope.logout = function() { Auth.$unauth(); };
    $scope.name = user.google.displayName;
    $scope.email = user.google.email;
    $scope.messages = [];
    var profile = $firebaseObject(Ref.child('users/'+user.uid));
    profile.$bindTo($scope, 'profile').then(function() {

        $scope.profile.email = user.google.email;  // will be saved to the database
        //ref.set({ foo: "baz" });  // this would update the database and $scope.data
      });
  }]);

'use strict';
/**
 * @ngdoc function
 * @name accessopolisApp.controller:CategoryCtrl
 * @description
 * # CategoryCtrl
 * A CRUD tool for managing Categories using AngularFire to manage a synchronized list.
 */
angular.module('accessopolisApp')
  .controller('CategoryCtrl', ["$scope", "Ref", "$firebaseArray", "$firebaseObject", "$timeout", function ($scope, Ref, $firebaseArray, $firebaseObject, $timeout) {
    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    $scope.categories = $firebaseArray(Ref.child('categories').limitToLast(10));

    // display any errors
    $scope.categories.$loaded().catch(alert);

    // provide a method for adding a Category
    $scope.addCategory = function(newCategory) {
      if( newCategory ) {
        // push a category to the end of the array
        $scope.categories.$add(newCategory)
          // display any errors
          .catch(alert);
      }
    };

    $scope.addSubcategory = function(category, newSubcategory){
      if( newSubcategory ) {

        var catRef = $firebaseObject(Ref.child('categories/'+category.$id));
        catRef.$bindTo($scope, 'selectedCat').then(function() {

          //var subcatRef = $firebaseArray(Ref.child('categories/'+category.$id+'/subcategory'));
          var subcatRef = $firebaseArray(Ref.child('categories/'+category.$id+'/subcategory'))
          subcatRef.$add(newSubcategory);  // will be saved to the database
          //ref.set({ foo: "baz" });  // this would update the database and $scope.data
        });
      }
    };


    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }
  }]);

/**
 * @ngdoc function
 * @name accessopolisApp.directive:ngShowAuth
 * @description
 * # ngShowAuthDirective
 * A directive that shows elements only when user is logged in. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('accessopolisApp')
  .directive('ngShowAuth', ['Auth', '$timeout', function (Auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuth(update);
        update();
      }
    };
  }]);


/**
 * @ngdoc function
 * @name accessopolisApp.directive:ngHideAuth
 * @description
 * # ngHideAuthDirective
 * A directive that shows elements only when user is logged out. It also waits for Auth
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('accessopolisApp')
  .directive('ngHideAuth', ['Auth', '$timeout', function (Auth, $timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it
        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !!Auth.$getAuth());
          }, 0);
        }

        Auth.$onAuth(update);
        update();
      }
    };
  }]);

'use strict';
/**
 * @ngdoc overview
 * @name accessopolisApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 * Add new routes using `yo angularfire:route` with the optional --auth-required flag.
 *
 * Any controller can be secured so that it will only load if user is logged in by
 * using `whenAuthenticated()` in place of `when()`. This requires the user to
 * be logged in to view this route, and adds the current user into the dependencies
 * which can be injected into the controller. If user is not logged in, the promise is
 * rejected, which is handled below by $routeChangeError
 *
 * Any controller can be forced to wait for authentication to resolve, without necessarily
 * requiring the user to be logged in, by adding a `resolve` block similar to the one below.
 * It would then inject `user` as a dependency. This could also be done in the controller,
 * but abstracting it makes things cleaner (controllers don't need to worry about auth state
 * or timing of displaying its UI components; it can assume it is taken care of when it runs)
 *
 *   resolve: {
 *     user: ['Auth', function(Auth) {
 *       return Auth.$getAuth();
 *     }]
 *   }
 *
 */
angular.module('accessopolisApp')

/**
 * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
 * when called, invokes Auth.$requireAuth() service (see Auth.js).
 *
 * The promise either resolves to the authenticated user object and makes it available to
 * dependency injection (see AccountCtrl), or rejects the promise if user is not logged in,
 * forcing a redirect to the /login page
 */
  .config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES) {
    // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
    // unfortunately, a decorator cannot be use here because they are not applied until after
    // the .config calls resolve, so they can't be used during route configuration, so we have
    // to hack it directly onto the $routeProvider object
    $routeProvider.whenAuthenticated = function(path, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }];
      $routeProvider.when(path, route);
      SECURED_ROUTES[path] = true;
      return $routeProvider;
    };
  }])
    .provider('user', function UserProvider() {
        this.$get = ['Auth', function(Auth) {
            return Auth.$requireAuth();
        }];
    })

  // configure views; whenAuthenticated adds a resolve method to ensure users authenticate
  // before trying to access that route
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      .when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/category', {
          templateUrl: 'views/category.html',
          controller: 'CategoryCtrl'
        })
      .whenAuthenticated('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl'
      })
      .otherwise({redirectTo: '/'});
  }])

  /**
   * Apply some route security. Any route's resolve method can reject the promise with
   * "AUTH_REQUIRED" to force a redirect. This method enforces that and also watches
   * for changes in auth status which might require us to navigate away from a path
   * that we can no longer view.
   */
  .run(['$rootScope', '$location', 'Auth', 'SECURED_ROUTES', 'loginRedirectPath',
    function($rootScope, $location, Auth, SECURED_ROUTES, loginRedirectPath) {
      // watch for login status changes and redirect if appropriate
      Auth.$onAuth(check);

      // some of our routes may reject resolve promises with the special {authRequired: true} error
      // this redirects to the login page whenever that is encountered
      $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
        if( err === 'AUTH_REQUIRED' ) {
          $location.path(loginRedirectPath);
        }
      });

      function check(user) {
        if( !user && authRequired($location.path()) ) {
          $location.path(loginRedirectPath);
        }
      }

      function authRequired(path) {
        return SECURED_ROUTES.hasOwnProperty(path);
      }
    }
  ])

  // used by route security
  .constant('SECURED_ROUTES', {});

(function () {
    "use strict";
    angular.module('accessopolis.navigation', [])
        .service('NavigationService', NavigationService)
        .directive('navigationBar', function() {
            return {
                restrict: 'C',
                scope: true,
                controller: NavigationController,
                templateUrl: 'scripts/feature/navigation/navigation-bar.html',
                controllerAs: 'ctrl'
            }
        });

    function NavigationService($q, Ref, $firebaseArray) {
        this.loadNavigationElements = function () {
            return $q(function (resolve, reject) {
                resolve($firebaseArray(Ref.child('categories')));
            });
        };
    }
    NavigationService.$inject = ["$q", "Ref", "$firebaseArray"];

    NavigationService.prototype.$inject = ['$q', 'Ref', '$firebaseArray'];

    function NavigationController(NavigationService, $rootScope) {
        var self = this;
        NavigationService.loadNavigationElements().then(function(data) {
            self.items = data;
        });
        this.showLocations = function(item, $event) {
            self.itemExpanded = undefined;
            $rootScope.$broadcast('SubcategorySelected', item);
            $event.stopPropagation();
        };
        this.displaySubMenu = function(item){
            self.itemExpanded = item.$id;
        };

    }
    NavigationController.$inject = ["NavigationService", "$rootScope"];

    NavigationController.prototype.$inject = ['NavigationService', '$rootScope'];


})();

(function() {
    "use strict";
    angular.module('accessopolis.search', [])
        .service('LocationSearchService', LocationSearchService)
        .directive('locationSearch', function() {
            return {
                restrict: 'C',
                scope: true,
                controller: LocationSearchController,
                controllerAs: 'ctrl',
                templateUrl: 'scripts/feature/search/location-search.html'
            }
        })
        .directive('location', ['$location', function($location) {
            return {
                restrict: 'A',
                scope: true,
                controller: function() {
                    var self = this;
                    this.showDetail = function() {
                        $location.path('/locations/'+self.location.$id);
                    }
                },
                controllerAs: 'ctrlLoc',
                bindToController: {
                    location: '='
                },
                templateUrl: 'scripts/feature/search/location.html'
            }
        }]);

    function LocationSearchService($q, Ref, $firebaseArray) {
        this.search = function(criterion) {
            return $q(function(resolve, reject) {
                var list = $firebaseArray(Ref.child('locations'));
                list.$loaded(function(data) {
                    var filteredResults = _.chain(data)
                        .filter(function(e) {
                            if(angular.isDefined(criterion.type)) {
                                return e.type === criterion.type;
                            }
                            return true;
                        })
                        .filter(function(e) {
                            if(angular.isDefined(criterion.text)) {
                                var split = criterion.text.split(/[\s,]/);
                                var minimumScore = Math.max(1, split.length -1);
                                return _.filter(split, function(w) {
                                        return e.text.toLowerCase().indexOf(w.toLowerCase()) > -1;
                                    }).length >= minimumScore;
                            }
                            return true;
                        }).value();
                    resolve(filteredResults);
                }, reject);
            });
        };
    }
    LocationSearchService.$inject = ["$q", "Ref", "$firebaseArray"];



    LocationSearchService.prototype.$inject = ['$q', 'Ref', '$firebaseArray'];

    function LocationSearchController(LocationSearchService, $rootScope) {

        var self = this;

        $rootScope.$on('SubcategorySelected', function(event, subcategory) {
            LocationSearchService.search({type: subcategory}).then(function(result) {
                self.resultList = result;
            });
        });

        this.searchParam = undefined;

        this.performSearch = function() {
            LocationSearchService.search({text: self.searchParam}).then(function(result) {
                self.resultList = result;
            });
        };
    }
    LocationSearchController.$inject = ["LocationSearchService", "$rootScope"];

    LocationSearchController.prototype.$inject = ['LocationSearchService', '$rootScope'];
})();

(function() {
    "use strict";
    angular.module('accessopolis.locationDetail', ['accessopolis.navigation'])
        .service('LocationDetailService', LocationDetailService)
        .controller('LocationDetailController', LocationDetailController)
        .controller('NewLocationController', NewLocationController)
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/locations/:id', {
                templateUrl: 'scripts/feature/detail/detail.html',
                controller: 'LocationDetailController',
                controllerAs: 'ctrl'
            }).when('/new-location', {
                templateUrl: 'scripts/feature/detail/new.html',
                controller: 'NewLocationController',
                controllerAs: 'ctrl'
            });
        }]);

    function LocationDetailService($q, $firebaseObject, Ref, $firebaseArray) {
        this.find = function(id) {
            return $q(function(resolve, reject) {
                var obj = $firebaseObject(Ref.child('locations').orderByKey().equalTo(id));
                obj.$loaded(function(val) {
                    resolve(val[id]);
                });
            });
        };

        this.create = function(location) {
            var mock = {lat: 45.833376, long: 9.030515};
            return $firebaseArray(Ref.child('locations')).$add(angular.extend(mock, location));
        }
    }
    LocationDetailService.$inject = ["$q", "$firebaseObject", "Ref", "$firebaseArray"];

    LocationDetailService.prototype.$inject = ['$q', '$firebaseObject', 'Ref', '$firebaseArray'];

    function LocationDetailController(LocationDetailService, $routeParams, $location) {

        var self = this;
        LocationDetailService.find($routeParams.id).then(function(result) {
            self.detail = result;
        });

        this.backToList = function() {
            $location.path('/');
        };
    }
    LocationDetailController.$inject = ["LocationDetailService", "$routeParams", "$location"];

    LocationDetailController.prototype.$inject = ['LocationDetailService', '$routeParams', '$location'];

    function NewLocationController(NavigationService, LocationDetailService, $location) {
        var self = this;
        this.location = {};
        //this.stars = _.range(0,6);

        this.save = function(frm) {
            if(!frm.$valid) {
                return;
            }
            LocationDetailService.create(self.location).then(function(data) {
                $location.path('/locations/'+data.name());
            }, function(err) {
                alert(err);
            });
        };

        NavigationService.loadNavigationElements().then(function(result) {
            result.$loaded(function(data) {
                self.subtypes = _.chain(data).map('subcategory').flatten().uniq().value();
            });
        });

    }
    NewLocationController.$inject = ["NavigationService", "LocationDetailService", "$location"];

    NewLocationController.prototype.$inject = ['NavigationService', 'LocationDetailService', '$location'];

})();

(function() {
    "use strict";
    angular.module('accessopolis.rating', [])
        .service('RatingService', RatingService)
        .directive('rating', function() {
            return {
                restrict: 'A',
                scope: true,
                controller: RatingController,
                controllerAs: 'ctrlRating',
                bindToController: {
                    rating: '='
                },
                templateUrl: 'scripts/feature/rating/rating.html'
            }
        });

    function calculateRate(total, list){
        if (!list || list.length == 0){
            return undefined;
        }
        var number = numeral(total);
        var calc = number.divide(list.length).format('0.0');
        return calc
    };

    function RatingService($q, Ref, $firebaseArray) {
        this.getRating = function(locationObj) {
            var locObj = locationObj;
            return $q(function(resolve, reject) {
                var ratingsByLocation = $firebaseArray(Ref.child('ratings').orderByChild('locationId').equalTo(locObj.$id));
                ratingsByLocation.$loaded(function(data) {
                    var ratingByType = _.groupBy(data, 'userType');

                    var totalStaff = _.sum(ratingByType['staff'], 'rate');
                    var totalPublic = _.sum(ratingByType['public'], 'rate');

                    var ratingByKind = _.groupBy(data, 'rateKind');

                    var totalMobility = _.sum(ratingByKind['mobility'], 'rate');
                    var totalHearing = _.sum(ratingByKind['hearing'], 'rate');
                    var totalVision = _.sum(ratingByKind['vision'], 'rate');
                    var totalMental = _.sum(ratingByKind['mental'], 'rate');

                    //TODO switch to use numeral.js
                    resolve({
                        public: calculateRate(totalPublic, ratingByType['public']),
                        staff : calculateRate(totalStaff, ratingByType['staff']),
                        mobility : calculateRate(totalMobility, ratingByKind['mobility']),
                        hearing : calculateRate(totalHearing, ratingByKind['hearing']),
                        vision : calculateRate(totalVision, ratingByKind['vision']),
                        mental : calculateRate(totalMental, ratingByKind['mental'])
                    });
                })
            });
        };
    }
    RatingService.$inject = ["$q", "Ref", "$firebaseArray"];

    RatingService.prototype.$inject = ['$q', 'Ref', '$firebaseArray'];

    function RatingController(RatingService) {

        var self = this;

        RatingService.getRating(self.rating).then(function(rating) {
            self.rate = rating;
        });

    }
    RatingController.$inject = ["RatingService"];

    RatingController.prototype.$inject = ['RatingService'];
})();
