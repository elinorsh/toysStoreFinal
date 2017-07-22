/**
 * Created by user on 27-Jun-17.
 */

app.controller('historyController', ['UserService', '$http',
    function(UserService, $http) {
        let self = this;
        self.noOrders = false;
        self.selectedOrder = "";
        self.detailsOrder = "";
        self.getOrders = function () {
            console.log('init');
            data = {username : UserService.username};
            $http.post('/getAllOrders', data)
                .then(function (res) {
                    self.orders = [];
                    if (res['data']['getAllOrders']) {
                        //console.log('res[data] is: '+JSON.stringify(res['data']));
                        angular.forEach(res['data']['result'], function (order) {
                            self.orders.push(order);
                        });
                    }
                    else{
                        self.noOrders = true;
                    }
                });
        };

        self.getProdsByOrder = function (orderID) {
            data = {username : UserService.username, orderID: orderID};
            $http.post('/getOrderDetails', data)
                .then(function (res) {

                    self.detailsOrder = res['data'][0];
                    console.log('self.detailsOrder: '+JSON.stringify(self.detailsOrder));
                    //console.log('self.detailsOrder[TotalPrice]: '+JSON.stringify(self.detailsOrder[0]['TotalPrice']));
                });
        };



    }]);
