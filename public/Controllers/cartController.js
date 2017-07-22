/**
 * Created by user on 26-Jun-17.
 */

app.controller('cartController', ['CartService','UserService','localStorageService','$http', '$location', '$window','$scope',
    function(CartService, UserService, localStorageService,$http, $location, $window, $scope) {
        let self = this;

        self.selectedProd = {id:"" ,name:"", price:"", desc:"", pic:"", amount:1};
        self.showProdsList = true;
        $scope.total = 0;
        self.prods = UserService.cart;


        if(self.prods.length==0){
            self.showCartProds = false;
        }
        else{
            self.showCartProds = UserService.isLoggedIn;
        }
        //self.showCartProds = (UserService.isLoggedIn && self.prods.length>0);
        //console.log('All cart product: ' + JSON.stringify(self.prods));

        angular.forEach(self.prods, function (prod) {
            //self.total += prod['amount']*prod['price'];
            $scope.total += prod['amount']*prod['price'];
        });

        self.getProducctDetails = function (prod) {
            // Appending dialog to document.body to cover sidenav in docs a
            self.selectedProd['name']=prod['name'];
            self.selectedProd['desc']=prod['desc'];
            self.selectedProd['price']=prod['price'];
            self.selectedProd['amount']=prod['amount'];
            self.selectedProd['pic']=prod['pic'];
            //self.selectedProd['id']=prod['ProductID'];
            self.showProdsList = false;
            //console.log('selectedProd of cart is: ' + JSON.stringify(self.selectedProd));
        };

        self.calculateTotal = function () {
            $scope.total = 0;
            angular.forEach(self.prods, function (prod) {
                //self.total += prod['amount']*prod['price'];
                $scope.total += prod['amount']*prod['price'];
            });
        };

        self.UpdateCart = function (prod1) {
            angular.forEach(self.prods, function (prod) {
                if (prod['name'] == prod1['name']) {
                    prod['amount'] = prod1['amount'];
                    prod['price'] = prod1['price'];
                }
                // the amount of selcted prod updated automaticlly?
            });
            self.calculateTotal();
            $window.alert('Your cart has been updated');
        };

        self.RemoveFromCart = function (prod) {
            self.prods.pop(prod);
            self.calculateTotal();
            localStorageService.set(UserService.username, self.prods);
            UserService.cart = self.prods;
            $window.alert('Your cart has been updated');
        };
        self.showProd = function () {
            self.showProdsList = true;
        };

        self.ExecuteOrder = function () {
            var currentTime = new Date();
            currentTime.setDate(currentTime.getDate()+16);
            var dateToSend = currentTime.getFullYear() + "-" + (currentTime.getMonth() + 1) + "-" + currentTime.getDate();
            var productsToSend = [];
            angular.forEach(self.prods, function (prod) {
                var price = parseFloat(JSON.stringify(prod['price']));
                var data = {ProductID: prod['id'], Amount: prod['amount'], ProductName: prod['name'], Category: prod['category']
                    , PicturePath: prod['pic'], Price: price, Manufacture: prod['manuf'], Description: prod['desc']};
                productsToSend.push(data);
            });
            var totalToSend = parseFloat(JSON.stringify($scope.total));
            let data = {username : UserService.username, delivery: dateToSend, products: productsToSend, total: totalToSend, currency: 'dollar', description: 'my Order'};
            $http.post('/executeOrder', data)
                .then(function (res) {
                    if (res) {
                        UserService.cart = [];
                        self.prods = [];
                        localStorageService.remove(UserService.username);
                        $scope.total = 0;
                        $window.alert('Order excecuted successfully!');
                    }
                    else{
                        $window.alert('Error! Order failed excecuted');
                    }

                });
        }

    }]);
