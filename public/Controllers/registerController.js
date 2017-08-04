/**
 * Created by user on 26-Jun-17.
 */

app.controller('registerController', ['UserService', '$location', '$window', '$http',
    function(UserService, $location, $window, $http) {
        let self = this;
        self.user = {username: '', fname: '', lname:'', pass:'', mail:'',country:'',restoreQ:null,restoreAns:null,favs:null};
        self.usernameOK = true;
        self.countries = [];
        self.selectedCountry = "";
        self.disableButton = false;
        self.initCats = function () {
            $http.get('/getAllCategories')
                .then(function (res) {
                    self.categoriesArr = res.data; //array of { "CategoryName:name, "CategoryID":id}
                    self.categories = []; //array of {"CategoryName":true/false}
                    angular.forEach(self.categoriesArr, function (cat) {
                        let temp = {};
                        temp[cat['CategoryName']] = false;
                        self.categories.push(temp);
                    });
                });
        };


        self.getCountries = function () {
          $http.get("countries.xml", {
              transformResponse: function (cnv) {
                  var x2js = new X2JS();
                  var aftCnv = x2js.xml_str2json(cnv);
                  return aftCnv;
              }
          }).then(function (response) {
              response.data.Countries.Country.forEach(function (item) {
                  var name = item.Name;
                  var toAdd = { "name": name};
                  self.countries.push(toAdd);
              })
          })

        };


        self.checkUsername = function () {
            let data = {"username" : this.user.username};
            console.log('data: '+ JSON.stringify(data));
            $http.post('/isUserNameExist', data)
                .then(function (res) {
                    if(res &&  res['data']['isUserNameExist']==false) {
                        console.log('username ok');
                        self.usernameOK = true;
                    }
                    else{
                        console.log('username taken');
                        self.usernameOK = false;
                    }
                });
        };

        self.register = function (valid) {
            if(valid){
                self.disableButton = true;
                let data = {username : self.user.username};
                var finishCategories = false;
                $http.post('/isUserNameExist', data)
                    .then(function (res) {
                        if(res && res['data']['isUserNameExist']==false) {
                            let counter = 0;
                            self.user.favs = [];
                            for (let i=0; i<self.categories.length; i++){
                                let catName = self.categoriesArr[counter]['CategoryName'];
                                if(self.categories[i]==true) {
                                    self.user.favs.push(catName)
                                    counter++;
                                }
                            }
                            if(counter > 0) {
                                finishCategories = true;
                            }
                            if(finishCategories==true) {
                                 var countryToSend = JSON.stringify(self.user['country']['name']);
                                self.user['country'] = countryToSend.substring(1, countryToSend.length-1);
                                $http.post('/register', self.user)
                                    .then(function (res) {
                                        if (res) {
                                            if (res['data']['register']) {
                                                self.disableButton = false;
                                                console.log('register!');
                                                $window.alert('You Register succesfuly! please login to continue');
                                                $location.path('/login');
                                            }
                                            else {
                                                self.disableButton = false;
                                                $window.alert('Error1! ' + res['error']);
                                            }
                                        }
                                        else {
                                            self.disableButton = false;
                                            $window.alert('Error2! ' + res['error'] + ' please try again');
                                        }
                                    }, function (errorResponse) {
                                        self.disableButton = false;
                                        $window.alert('Error3! '+errorResponse);
                                    });
                            }
                            else{ //no category has been chosen
                                self.disableButton = false;
                                $window.alert('Error! please choose favorite category');
                            }
                        }
                        else{
                            self.disableButton = false;
                            $window.alert('Error! username "'+self.user.username+'" is already taken, please try a different one');
                        }
                    }, function (errorResponse) {
                        self.disableButton = false;
                        $window.alert('Error4! '+errorResponse);
                    });
            }
        };

    }]);
