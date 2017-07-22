/**
 * Created by user on 26-Jun-17.
 */

app.controller('loginController', ['UserService','localStorageService', '$location', '$window', '$http',
    function(UserService, localStorageService, $location, $window, $http) {
        let self = this;
        self.passToShow= '';
        self.isRestore = false;
        self.showRestoreQues = false;
        self.user = {
            usernameInput: '',
            restoreAnsInput: ''
        };

        self.userLogin = {
            username: "",
            password: ""
        };
        self.login = function(valid) {
            if (valid && !UserService.isLoggedIn) {
                UserService.login(self.userLogin).then(function (success) {
                    data = {username : self.userLogin.username, usertoken: success['data']};
                    localStorageService.cookie.set("user", JSON.stringify(data), 3); //3 days to expire
                    UserService.isLoggedIn = true;
                    $window.alert('You are logged in');
                    $location.path('/');
                }, function (error) {
                    self.errorMessage = error.data;
                    console.log('login has failed. error: '+JSON.stringify(error.data));
                    $window.alert('log-in has failed');
                })
            }
        };

        self.RestorePass = function() {
            self.isRestore = true;
        };

        self.getRestoreQ = function() {
            let data = {username : self.user.usernameInput};
            //console.log('username data is: ' + JSON.stringify(data));
            $http.post('/getRestoreQA', data)
                .then(function (res) {
                    if (res['data']['getRestoreQA']) {
                        self.restoreQ = res['data']['results'][0]['RestoreQues'];
                        self.restoreAns = res['data']['results'][0]['RestoreAns'];
                        self.passToShow = res['data']['results'][0]['Password'];
                        self.showRestoreQues = true;
                    }
                    else{
                        $window.alert('Restore password has failed');
                    }
                });
        };

        self.checkRestoreAns = function () {
            if (self.user.restoreAnsInput == self.restoreAns){
                $window.alert('Your password is: ' + JSON.stringify(self.passToShow));
            }
            else{
                $window.alert('Restore password has failed');
            }
            self.isRestore = false;
            self.showRestoreQues = false;
        }

    }]);
