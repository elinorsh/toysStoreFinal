/**
 * Created by user on 26-Jun-17.
 */


app.factory('CartService', ['$http','UserService','localStorageService', '$window', function($http, UserService,localStorageService, $window) {
    let service = {};

    service.addToCart = function (prod) {
        return $http.post('/isProductInStock', {pid: prod['id'], amount: prod['amount']})
            .then(function (res) {
                if (res && res['data']['isProductInStock']) {
                    //console.log('res is: '+JSON.stringify(res));
                    console.log('index is: '+UserService.cart.indexOf(prod));
                    var index = arrayObjectIndexOf(UserService.cart, prod)
                    if (  index != -1 ) { //if the product is already added to cart
                        //var current = UserService.cart.pop(prod);
                        UserService.cart[index]['amount'] += prod['amount'];
                        //prod['amount'] += current['amount'];
                        //prod['price'] += current['price'];
                    }
                    else {
                        UserService.cart.push(prod);
                    }

                    let valueStored = localStorageService.get(UserService.username);
                    //console.log('valueStored is: '+JSON.stringify(valueStored));
                    if (localStorageService.set(UserService.username, UserService.cart)) {
                        let valueStored = localStorageService.get(UserService.username);
                        console.log('cart added to storage. now valueStored is: '+JSON.stringify(valueStored));
                    }
                    else
                        console.log('failed to add cart');


                    $window.alert('Product ' + prod['name'] + ' was added to cart!');
                    return Promise.resolve(res);
                }
                else {
                    $window.alert('Sorry! not enough in stock :(');
                    return Promise.resolve(res);
                }
            }).catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);

function arrayObjectIndexOf(arr, obj){
    for(var i = 0; i < arr.length; i++){
        if(angular.equals(arr[i]['name'], obj['name'])){
            return i;
        }
    };
    return -1;
}