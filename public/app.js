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
        .when("/cities", {
            templateUrl : "views/cities.html",
            controller: 'citiesController'
        })
        .when("/storage", {
            templateUrl : "views/storage.html",
            controller: 'storageController'
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
            controller: 'cartController'
        })
        .when("/test", {
            templateUrl : "views/test.html",
            controller: 'homeController'
        })
        .when("/history", {
            templateUrl : "views/history.html",
            controller: 'historyController'
        })
        .when("/about", {
            templateUrl : "views/about.html",
            //controller: 'historyController'
        })
        .otherwise({redirect: '/',
        });
}]);

//-------------------------------------------------------------------------------------------------------------------

