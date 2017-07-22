/**
 * Created by Hasidi on 20/06/2017.
 */

// it is just an example! It no means it is the right way to handle storage global calls!!!!!
//Follow the design principles you have learned during lessons!!!
angular.module("myApp")
    .factory('storageService', ['localStorageService', function (localStorageService) {
    let self = this;
    self.value1 = '';
    self.value2 = '';

    self.addData = function () {
        let lsLength = localStorageService.length();
        let valueStored = localStorageService.get(self.key1);
        if (!valueStored) {
            if (localStorageService.set(self.key1, self.value1))
                console.log('data was added successfully');
            else
                console.log('failed to add the data');
        }
        else
            console.log('failed to add the data');

        localStorageService.get(key);
    };
    self.deleteData = function () {
        let valueStored = localStorageService.get(self.key1);
        if (valueStored) {
            localStorageService.remove(self.key1);
            console.log('data was deleted successfully');
        }
        else
            console.log('failed to delete the data');
    };

    self.addCookie = function (key, value) {
        let cookieVal = localStorageService.cookie.get(key);
        if (!cookieVal)
            if (localStorageService.cookie.set(key,value, 3))
                console.log('cookie was added successfully');
            else
                console.log('failed to add the cookie1');
        else
            console.log('failed to add the cookie2');
    };

    self.deleteCookie = function () {

        let cookieVal = localStorageService.cookie.get(self.cookieKey);
        if (cookieVal) {
            localStorageService.cookie.remove(self.cookieKey);
            console.log('data was deleted successfully');
        }
        else
            console.log('failed to delete the cookie');
    };
}]);