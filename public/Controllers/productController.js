/**
 * Created by user on 26-Jun-17.
 */

angular.module("myApp").controller('productController', ['$http','$window','CartService', 'UserService', 'ProductModel', function ($http,$window,CartService,UserService,ProductModel) {
    let self = this;
    self.selectedCat = "all";
    self.orderby = "ProductName";
    self.searchInput = "";
    self.showProds = true;
    self.showRecProds = UserService.isLoggedIn;
    self.selectedProdAll = {id:"" ,name:"", price:"", desc:"", manuf:"", category:"", pic:"", amount:1};
    self.selectedProdRec = {id:"" ,name:"", price:"", desc:"", manuf:"", category:"", pic:"", amount:1};
    $http.get('/getAllProducts')
        .then(function (res) {
            // self.cities = res.data;
            self.setProdsData(res);
            $http.get('/getAllCategories')
                .then(function (res) {
                    self.categories = res.data;
                    if (UserService.isLoggedIn) {
                        let data = {username : UserService.username};
                        $http.post('/getRecommendedProd', data)
                            .then(function (res) {
                                self.setRecProdsData(res);
                            });
                    }
                });
        });

    self.setRecProdsData = function (res) {
        self.recommendedProds = [];
        angular.forEach(res.data, function (prod) {
            self.recommendedProds.push(new ProductModel(prod[0]));
        });
    };

    self.setProdsData = function (res) {
        self.prods = [];
        angular.forEach(res.data, function (prod) {
            self.prods.push(new ProductModel(prod));
        });
    };

    self.showProd = function (kind) {
        switch(kind){
            case 'all':
                self.showProds = true;
                break;
            case 'rec':
                self.showRecProds=true;
                break;
        }
    };

    self.getProducctDetails = function (prod, kind) {
        switch(kind){
            case 'all':
                self.showProds = false;
                self.selectedProdAll['name']=prod['ProductName'];
                self.selectedProdAll['desc']=prod['Description'];
                self.selectedProdAll['price']=prod['Price'];
                self.selectedProdAll['pic']=prod['PicturePath'];
                self.selectedProdAll['id']=prod['ProductID'];
                self.selectedProdAll['manuf']=prod['Manufacture'];
                self.selectedProdAll['category']=prod['Category'];
                break;
            case 'rec':
                self.showRecProds=false;
                self.selectedProdRec['name']=prod['ProductName'];
                self.selectedProdRec['desc']=prod['Description'];
                self.selectedProdRec['price']=prod['Price'];
                self.selectedProdRec['pic']=prod['PicturePath'];
                self.selectedProdRec['id']=prod['ProductID'];
                self.selectedProdRec['manuf']=prod['Manufacture'];
                self.selectedProdRec['category']=prod['Category'];
                break;
        }

        //console.log(self.selectedProd);
    };

    self.getAllProds = function () {
        self.selectedCat = "all";
        self.searchInput = "";
        $http.get('/getAllProducts')
            .then(function (res) {
                // self.cities = res.data;
                self.setProdsData(res);
            });
    };

    self.addToCartProd = function (kind) {
        if (!UserService.isLoggedIn){
            $window.alert('Sorry! you must login to buy products');
        }
        else{
            var prod = self.selectedProdAll;
            if(kind == 'rec')
                prod = self.selectedProdRec;
            CartService.addToCart(prod);
            self.showProd(kind);

        }
    };

    self.getProdsByCategory = function (category) {
        console.log('category is: '+category);
        if (category!="all") {
            data = {"category":category};
            $http.post('/getProductsByCategory', data)
                .then(function (res) {
                    self.setProdsData(res);
                });
        }
        else
            self.getAllProds();

    };
    self.searchProduct = function () {
        console.log('search input: '+self.searchInput);
        data = {"search":self.searchInput};
        $http.post('/findProducts', data)
            .then(function (res) {
                console.log('res: '+JSON.stringify(res));
                self.setProdsData(res);
            });

    };

}]);