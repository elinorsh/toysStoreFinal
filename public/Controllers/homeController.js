/**
 * Created by user on 26-Jun-17.
 */

app.controller('homeController', ['$http','$location','UserService','CartService','localStorageService', '$window','ProductModel', function($http,$location, UserService,CartService,localStorageService, $window, ProductModel) {
    let self = this;
    self.top5 = [];
    self.selectedProdNew = {id:"" ,name:"", price:"", desc:"",manuf:"", category:"", pic:"", amount:1};
    self.selectedProdTop = {id:"" ,name:"", price:"", desc:"",manuf:"", category:"", pic:"", amount:1};
    self.showTop=true;
    self.showNew = UserService.isLoggedIn;
    let cookie = localStorageService.cookie.get('user');
    self.UserService = UserService;

    if(cookie && !UserService.isLoggedIn){
        let username = cookie['username'];
        data = {username : username, usertoken : cookie['usertoken']};
        UserService.login(data).then(function (success) {
            data = {username : username, token: success['data']};
            localStorageService.cookie.set("user", JSON.stringify(data), 3); //3 days to expire
            UserService.username = username;
            $window.alert('You are logged in');
            $location.path('/');
        }, function (error) {
            console.log('login has failed. error: '+JSON.stringify(error.data));
        });
    }

    self.getTop5 = function () {
        $http.get('/getTop5Prod')
            .then(function (res) {
                self.setTop5Data(res);
                if(UserService.isLoggedIn) {
                    $http.get('/getNewProd')
                        .then(function (res) {
                            self.setNewProdData(res);
                        });
                }
            });
    };


    self.setTop5Data = function (res) {
        self.top5 = [];
        angular.forEach(res.data, function (prod) {
            self.top5.push(new ProductModel(prod[0]));
        });

    };
    self.setNewProdData = function (res) {
        self.newProds = [];
        angular.forEach(res.data, function (prod) {
            self.newProds.push(new ProductModel(prod));
        });
    };

    self.addToCartHome = function (kind) {
        if (!UserService.isLoggedIn){
            $window.alert('Sorry! you must login to buy products');
        }
        else{
            let prod = self.selectedProdTop;
            if(kind == 'new'){
                prod = self.selectedProdNew;
            }
            CartService.addToCart(prod);
        }

    };

    self.showProd = function (kind) {
        switch(kind){
            case 'new':
                self.showNew = true;
                break;
            case 'top':
                self.showTop=true;
                break;
        }
    };

    self.getProducctDetails = function (prod, kind) {
        // Appending dialog to document.body to cover sidenav in docs app

        switch(kind){
            case 'new':
                self.selectedProdNew['name']=prod['ProductName'];
                self.selectedProdNew['desc']=prod['Description'];
                self.selectedProdNew['price']=prod['Price'];
                self.selectedProdNew['pic']=prod['PicturePath'];
                self.selectedProdNew['id']=prod['ProductID'];
                self.selectedProdNew['manuf']=prod['Manufacture'];
                self.selectedProdNew['category']=prod['Category'];
                self.showNew = false;
                console.log(self.selectedProdNew);
                break;
            case 'top':
                self.selectedProdTop['name']=prod['ProductName'];
                self.selectedProdTop['desc']=prod['Description'];
                self.selectedProdTop['price']=prod['Price'];
                self.selectedProdTop['pic']=prod['PicturePath'];
                self.selectedProdTop['id']=prod['ProductID'];
                self.selectedProdTop['manuf']=prod['Manufacture'];
                self.selectedProdTop['category']=prod['Category'];
                self.showTop=false;
                console.log(self.selectedProdTop);
                break;

        }
    };

}]);
