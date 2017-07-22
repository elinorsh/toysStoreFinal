/**
 * Created by user on 26-Jun-17.
 */

app.controller('citiesController', ['$http', 'CityModel', function($http, CityModel) {
    let self = this;
    self.fieldToOrderBy = "name";
    // self.cities = [];
    self.getCities = function () {
        $http.get('/cities')
            .then(function (res) {
                // self.cities = res.data;
                //We build now cityModel for each city
                self.cities = [];
                angular.forEach(res.data, function (city) {
                    self.cities.push(new CityModel(city));
                });
            });
    };
    self.addCity = function () {
        let city = new CityModel(self.myCity);
        if (city) {
            city.add();
            self.getCities();
        }
    };
}]);
