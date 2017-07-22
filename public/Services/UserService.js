/**
 * Created by user on 26-Jun-17.
 */

app.factory('UserService', ['$http','$location','localStorageService', function($http,$location,localStorageService) {
    let service = {};
    service.isLoggedIn = false;
    service.username = "guest";
    service.lastLogin=null;
    service.cart = [];
    service.login = function(user) {
        return $http.post('/login', user)
            .then(function(response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'usertoken': token,
                    'username' : user.username
                };
                service.isLoggedIn = true;
                service.username = user.username;

                let lsLength = localStorageService.length();
                if(lsLength > 0){
                    console.log('username: '+service.username);
                    let valueStored = localStorageService.get(service.username);
                    console.log('valuedStored: '+valueStored);
                    if(valueStored && valueStored != null){
                        service.cart = valueStored;
                    }
                    else{
                        service.cart = [];
                    }
                    valueStored = localStorageService.get(service.username+"_time");
                    if(valueStored){
                        service.lastLogin = valueStored;
                    }
                    else{
                        service.lastLogin = new Date();
                    }
                }
                if (localStorageService.set(service.username+"_time", new Date())) {
                    let valueStored = localStorageService.get(service.username+"_time");
                    console.log('date updated. now date is: '+JSON.stringify(valueStored));
                }

                return Promise.resolve(response);
            })
            .catch(function (e) {
                console.log('Error! '+e);
                return Promise.reject(e);
            });
    };

    service.logout = function () {
        service.isLoggedIn = false;
        localStorageService.cookie.remove('user');
        service.username = "guest";
        $location.path('/');
    };

    return service;
}]);
