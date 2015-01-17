'use strict';

var $j = jQuery.noConflict();

var roomApp = angular.module('roomApp', ['uiSlider']);
var buildingChkBox = {};
var buildingLabels = [];
var typeChkBox = {};
var typeLabels = [];

roomApp.controller('RoomListCtrl', ['$scope', '$http', function ($scope, $http, $log, $filter) {
	//initialize datePicker=today and timePicker=now
  $scope.datePicker = new Date();
  $scope.timePicker = new Date($scope.datePicker.getYear(), $scope.datePicker.getMonth()+1, $scope.datePicker.getDate(), $scope.datePicker.getHours(), $scope.datePicker.getMinutes(), 0);

	$scope.$watchCollection('[datePicker, timePicker]', function(){
		$http.get('http://e-wit.co.uk/gyngai/labcrasher/getAvailabilities/'+$scope.datePicker+'/'+$scope.timePicker)
		.success(function(data) {
			$scope.availabilities = data;
			$scope.orderByField = 'remaining';
			$scope.reverseSort = true;
      
      //check the status of the RESTful http call
      if(data.length == 0 ) {
        $scope.dataStatus = "empty";
      } else {
        $scope.dataStatus = "not empty";
      }

      //clear the object before assigining
      buildingChkBox = {};
      typeChkBox = {}; 

			//set the buildingChkBox object to false (not checked), then later assign to filterBuildings 
			data.forEach(function(element){
				buildingChkBox[element.building] = false;
			});
      //set the typeChkBox object to false (not checked), then later assign to filterTypes 
			data.forEach(function(element){
				typeChkBox[element.type] = false;
			});

      //clear the array before assigning
      buildingLabels.length = 0; 
      typeLabels.length = 0; 

			//sort and push the building name into buildingLabels array
			Object.keys(buildingChkBox)
          .sort()
          .forEach(function(v, i) {
            buildingLabels.push({name: v});
          });
      //sort and push the type name into typeLabels array
			Object.keys(typeChkBox)
          .sort()
          .forEach(function(v, i) {
            typeLabels.push({type: v});
          });

      });
	});

	//passing the Math function to front end
	$scope.Math = window.Math;

  //true/false for filter purpose
	$scope.filterBuildings = buildingChkBox;
  var orginBuilding = angular.copy($scope.filterBuildings);
	$scope.filterTypes = typeChkBox;
  var originType = angular.copy($scope.filterTypes);
	
	//label of buildig for the side bar
	$scope.buildings = buildingLabels;
  $scope.types = typeLabels;

  $scope.lower_bound = 0;
  $scope.upper_bound = 600; //upper bound for slider, 600 = 10 hours
   
  $scope.durationRange = function(item) {
      return (parseInt(item.remaining) >= $scope.lower_bound && parseInt(item.remaining) <= $scope.upper_bound);
  };

  $scope.clearDateTime = function () {
    $scope.datePicker = new Date();
    $scope.timePicker = new Date($scope.datePicker.getYear(), $scope.datePicker.getMonth()+1, $scope.datePicker.getDate(), $scope.datePicker.getHours(), $scope.datePicker.getMinutes(), 0);
  };

  $scope.clearDuration = function() {
    $scope.lower_bound = 0;
    $scope.upper_bound = 600; //upper bound for slider, 600 = 10 hours
  };

  $scope.clearBuilding = function () {
    angular.copy(orginBuilding, $scope.filterBuildings);
  };

  $scope.clearType = function () {
    angular.copy(originType, $scope.filterTypes);
  }; 

  $scope.clearAll = function () {
    $scope.datePicker = new Date();
    $scope.timePicker = new Date($scope.datePicker.getYear(), $scope.datePicker.getMonth()+1, $scope.datePicker.getDate(), $scope.datePicker.getHours(), $scope.datePicker.getMinutes(), 0);
    
    $scope.lower_bound = 0;
    $scope.upper_bound = 600; //upper bound for slider, 600 = 10 hours
    
    angular.copy(orginBuilding, $scope.filterBuildings);
    angular.copy(originType, $scope.filterTypes);
  };

}]);

roomApp.config(['$sceProvider', function($sceProvider) {
    $sceProvider.enabled(false);
}]);



roomApp.filter('buildingFilter', function () {
  return function(input, filter) {
    var result;
    
    if(canFilter(filter)) {
      result = [];
      
      angular.forEach(input, function(wine) {
        if(filter[wine.building])
          result.push(wine);
      });
      
    } else
      result = input;
    
    return result;
  };
  
  function canFilter(filter) {
    var hasFilter = false;
    angular.forEach(filter, function(isFiltered) {
      hasFilter = hasFilter || isFiltered;
    });
    return hasFilter;
  }
});

roomApp.filter('typeFilter', function () {
  return function(input, filter) {
    var result;
    
    if(canFilter(filter)) {
      result = [];
      
      angular.forEach(input, function(wine) {
        if(filter[wine.type])
          result.push(wine);
      });
      
    } else
      result = input;
    
    return result;
  };
  
  function canFilter(filter) {
    var hasFilter = false;
    angular.forEach(filter, function(isFiltered) {
      hasFilter = hasFilter || isFiltered;
    });
    return hasFilter;
  }
});

