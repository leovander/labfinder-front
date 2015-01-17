'use strict';

$(function() {
    $( "#datepicker" ).datepicker();
});

var $j = jQuery.noConflict();

var roomApp = angular.module('roomApp', ['uiSlider']);
var buildingChkBox = {};
var buildingLabels = [];
var typeChkBox = {};
var typeLabels = [];
// var maxDuration; 

roomApp.controller('RoomListCtrl', ['$scope', '$http', function ($scope, $http, $log, colorpicker) {
	
	$scope.$watchCollection('[datePicker, timePicker]', function(){
		$http.get('http://e-wit.co.uk/gyngai/labcrasher/getAvailabilities/2014-12-12/10:00:00').
		//$http.get('http://e-wit.co.uk/gyngai/labcrasher/getAvailabilities/'+$scope.datePicker+'/'+$scope.timePicker).
		success(function(data) {
			$scope.availabilities = data;
			$scope.orderByField = 'remaining';
			$scope.reverseSort = true;

			//set the buildingChkBox object to false, then later assign to filterBuildings 
			data.forEach(function(element){
				buildingChkBox[element.building] = false;
			});

			data.forEach(function(element){
				typeChkBox[element.type] = false;
			});

			//sort and push the building name into buildings array
			Object.keys(buildingChkBox)
			    .sort()
			    .forEach(function(v, i) {
			    	buildingLabels.push({name: v});
			      	//console.log(v, buildingChkBox[v]);
			});

			Object.keys(typeChkBox)
			    .sort()
			    .forEach(function(v, i) {
			    	typeLabels.push({type: v});
			      	//console.log(v, typeChkBox[v]);
	       	});

		});
	});


	// $scope.sliderConfig = {
 //        min: 0,
 //        max: 240,
 //        step: 15, 
 //        value: 0
 //    }
    
 //    $scope.price = 0;
    
 //    $scope.setPrice = function(price) {
 //        $scope.price = price;    
 //    }

 //    $scope.durationFilter = function (availabilities) {
	// 	if(availabilities.duration >= sliderConfig.value){
	// 		return true; 
	// 	}
	// };


	//passing the Math function to front end
	$scope.Math = window.Math; 

	//true/false for filter purpose
	$scope.filterBuildings = buildingChkBox; 

	$scope.filterTypes = typeChkBox;
	
	//label of buildig for the side bar
	$scope.buildings = buildingLabels; 

	$scope.types = typeLabels; 

  $scope.lower_bound = 0;
  $scope.upper_bound = 240;
  
  $scope.durationRange = function(item) {
    return (parseInt(item.remaining) >= $scope.lower_bound && parseInt(item.remaining) <= $scope.upper_bound);
  };
}]);


// roomApp.directive("slider", function() {
//     return {
//         restrict: 'A',
//         scope: {
//             config: "=config",
//             price: "=model"
//         },
//         link: function(scope, elem, attrs) {
//             var setModel = function(value) {
//                 scope.model = value;   
//             }
            
//             $(elem).slider({
//                 range: false,
// 	            min: scope.config.min,
// 	            max: scope.config.max,
//                 step: scope.config.step,
//                 value: scope.config.value,
//                 slide: function(event, ui) { 
//                     scope.$apply(function() {
//                         scope.price = ui.value;
//                     });
// 	            }, 
// 	            stop: function(event, ui) {
// 	            	scope.$apply(function(){
// 	          			scope.config.value = ui.value;
// 	            	});
// 	            }
// 	        });
//     	}
//     }
// });

// roomApp.filter('filterDuration', function () {
// 	return function(input, filter) {
// 		var result; 
// 		if(canFilter(filter()) {
// 			result = [];

// 			angular.forEach(input, function(avail) {
// 				if(filter[avail.duration] >= input)
// 					result.push(wine);
// 			});
// 		} else 
// 			result = input; 

// 		return result;
// 	};

// 	function canFilter(filter) {
//     	var hasFilter = false;
//     	angular.forEach(filter, function(isFiltered) {
//       		hasFilter = hasFilter || isFiltered;
//     	});
//     	return hasFilter;
//   	}
// });


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

