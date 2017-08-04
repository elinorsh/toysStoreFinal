/**
 * Created by Noga on 18/06/2017.
 */

let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);
//-------------------------------------------------------------------------------------------------------------------

app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});

//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

//-------------------------------------------------------------------------------------------------------------------

app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",
            controller : "homeController"
        })
        .when("/login", {
            templateUrl : "views/login.html",
            controller : "loginController"
        })
        .when("/shop", {
            templateUrl : "views/shop.html",
            controller: 'productController'
        })
        .when("/register", {
            templateUrl : "views/register.html",
            controller: 'registerController'
        })
        .when("/cart", {
            templateUrl : "views/cart.html",
            controller: 'cartController',
            resolve: {
                "check": function (UserService, $location) {
                    if (!UserService.isLoggedIn) {
                        console.log('isLoggedIN: '+UserService.isLoggedIn);
                        alert("You don't have access here!");
                        $location.path('/');
                    }
                }
            }
        })
        .when("/history", {
            templateUrl : "views/history.html",
            controller: 'historyController',
            resolve: {
                "check": function (UserService, $location) {
                    if (!UserService.isLoggedIn) {
                        console.log('isLoggedIN: '+UserService.isLoggedIn);
                        alert("You don't have access here!");
                        $location.path('/');
                    }
                }
            }
        })
        .when("/about", {
            templateUrl : "views/about.html",
            resolve: {
                "check": function (UserService, $location) {
                    if (!UserService.isLoggedIn) {
                        console.log('isLoggedIN: '+UserService.isLoggedIn);
                        alert("You don't have access here!");
                        $location.path('/');
                    }
                }
            }
        })
        .otherwise({redirect: '/',
        });
}]);

//-------------------------------------------------------------------------------------------------------------------
//
// app.run(['$rootScope', '$location', 'UserService', function ($rootScope, $location, UserService) {
//     $rootScope.$on('$routeChangeStart', function (event) {
//         console.log(event);
//         if (!UserService.isLoggedIn()) {
//             console.log('DENY');
//             event.preventDefault();
//             $location.path('/login');
//         }
//         else {
//             console.log('ALLOW');
//             $location.path('/home');
//         }
//     });
// }]);