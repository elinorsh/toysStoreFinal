/**
 * Created by user on 22-Jun-17.
 */

app.factory('ProductModel', ['$http', function($http) {
    function ProductModel(prod) {
        if (prod)
            this.setData(prod);
    }
    ProductModel.prototype = {
        setData: function(prodData) {
            angular.extend(this, prodData);
        },
        getTop5: function () {
            $http.get('/getTop5Prod').then(function(top5Prods) {
                this.setData(top5Prods);
            });
        },
        getNewProds: function () {
            $http.get('/getNewProd').then(function(newProd) {
                this.setData(newProd);
            });
        },
        getAll: function () {
            $http.get('/getAllProducts').then(function(allProd) {
                this.setData(allProd);
            });
        }
    };
    return ProductModel;
}]);