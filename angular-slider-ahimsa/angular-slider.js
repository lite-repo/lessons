var app = angular.module('rzSliderDemo', ['rzModule', 'ui.bootstrap']);

app.controller('MainCtrl', function ($scope, $rootScope, $timeout, $modal) {
    //Minimal slider config
    $scope.minSlider = {
        value: 10
    };

    //Slider with selection bar
    $scope.slider_visible_bar = {
        value: 10,
        options: {
            showSelectionBar: true
        }
    };

    //Range slider config
    $scope.minRangeSlider = {
        minValue: 10,
        maxValue: 90,
        options: {
            floor: 0,
            ceil: 100,
            step: 1
        }
    };
    
    //Slider with selection bar
    $scope.color_slider_bar = {
      value: 12,
      options: {
        showSelectionBar: true,
        getSelectionBarColor: function(value) {
          if (value <= 3)
            return 'red';
          if (value <= 6)
            return 'orange';
          if (value <= 9)
            return 'yellow';
          return '#2AE02A';
        }
      }
    };
});