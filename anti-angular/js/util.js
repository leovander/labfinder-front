$(document).foundation({
  offcanvas : {
    open_method: 'move',
    close_on_click : false
  }
});

//Globals
var availableRooms = []; //List of all rooms for ajax call
var filteredRooms = []; //List of rooms after a filter is added
var buildingOptions = []; //Dynamic List of all available building types
var roomTypeOptions = []; //Dynamic List of all available room types
var roomTypeImages = { //Placeholders to image paths for the table
	Classroom: "img/class.png",
	Linux: "img/linux.png",
	Mac: "img/mac.png",
	Windows: "img/windows.png"
};

var appliedFilters = { //These are the global filters that are applied after refreshFilters() is called
	buildings: [],
	rooms: [],
	lowerRange: 0, //Left hand side of the slider
	upperRange: 600, //Right hand side of the slider
	date: "",
	time: ""
};

$(function() {
	$("#slider-range").slider({
      range: true, //The slider started with two slide handle objects
      min: 0, //Min 0 hours
      max: 600, //Max 10 hours
      step: 15, //Only check classes 15 mins at a time
      values: [ 0, 600 ],
      slide: function(event, ui) { //This logic is only here to display under slider
	    var min = {
		    hours: 0,
		    mins: 0
	    };
	    
	    var max = {
		    hours: 0,
		    mins: 0
	    };
	    
		min.hours = parseInt(ui.values[0] / 60);
		max.hours = parseInt(ui.values[1] / 60);
	   
		min.mins = parseInt(ui.values[0]) % 60;
		max.mins = parseInt(ui.values[1]) % 60;
	    
	    if(min.hours < 1) {
			$("#duration #min").html(min.mins + "min");
	    } else {
			if(min.mins < 1) {    
		    	$("#duration #min").html(min.hours + " hr");
		    } else {
			    $("#duration #min").html(min.hours + " hr " + min.mins + "min");
		    }
	    }
	    
	    if(max.hours < 1) {
			$("#duration #max").html(max.mins + "min");
	    } else {
		    if(max.mins < 1) {    
		    	$("#duration #max").html(max.hours + " hr");
		    } else {
			    $("#duration #max").html(max.hours + " hr " + max.mins + "min");
		    }
	    }
      },
      stop: function(event, ui) {
        appliedFilters.lowerRange = ui.values[0]; //Lower range applied to filter
        appliedFilters.upperRange = ui.values[1]; //Upper range applied to filter
        refreshFilters(); //refresh the global filters
      }
    });
    
    $("#datepicker").datepicker({
	    onClose: function(dateInput) { //Updates the global date filter when a date is chosen
		    appliedFilters.date = dateInput; //Date input applied to global filter
		    var now = new Date();
			var prevDate = $("#datepicker").datepicker("getDate");
			prevDate = prevDate.getFullYear()+"-"+(prevDate.getMonth()+1)+"-"+prevDate.getDate();
			if(prevDate != (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate())) {
				pullRooms();
			}
			
		    refreshFilters(); //refresh the global filters
	    },
	    dateFormat: "yy-mm-dd"
    });
    var now = new Date();
    $("#datepicker").datepicker("setDate", (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate())); //At start, set Date input to today
	appliedFilters.date = (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()); //Date input applied to global filter
	
	if(now.getHours() < 10) { //Logic to add a '0' in front of single digit hours
		if(now.getMinutes() < 10) {
			document.getElementById("timeFilter").value = "0"+now.getHours()+":0"+now.getMinutes();	
		} else {
			document.getElementById("timeFilter").value = "0"+now.getHours()+":"+now.getMinutes();
		}
		
		appliedFilters.time = "0"+now.getHours()+":"+now.getMinutes(); //Time input with preappended '0' applied to global filter
	} else {
		if(now.getMinutes() < 10) {
			document.getElementById("timeFilter").value = now.getHours()+":0"+now.getMinutes();	
		} else {
			document.getElementById("timeFilter").value = now.getHours()+":"+now.getMinutes();
		}
		appliedFilters.time = now.getHours()+":"+now.getMinutes(); //Time input applied to global filter
	}
	
	pullRooms();
	
	$("#timeFilter").on("change", function() { //Updates the global time filter when the time input is changed
		appliedFilters.time = $("#timeFilter").val(); 
		pullRooms();
	});
	
	$(".off-canvas-list li label span").on("click", function() { //Clearing filters logic
		var type = $(this).parent().parent().parent(); //Finds which type of filter to remove
		var now = new Date();
		var prevDate = $("#datepicker").datepicker("getDate");
		prevDate = prevDate.getFullYear()+"-"+(prevDate.getMonth()+1)+"-"+prevDate.getDate();
		
		if(type.hasClass("dateFilters")) {
			$("#datepicker").datepicker("setDate", (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()));
			appliedFilters.date = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
			
			if(prevDate != (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate())) {
				pullRooms();
				return;
			}
			refreshFilters(); //refresh the global filters
			return;
		} else if(type.hasClass("timeFilters")) {
			if(now.getHours() < 10) {
				if(now.getMinutes() < 10) {
					document.getElementById("timeFilter").value = "0"+now.getHours()+":0"+now.getMinutes();	
				} else {
					document.getElementById("timeFilter").value = "0"+now.getHours()+":"+now.getMinutes();
				}
				appliedFilters.time = "0"+now.getHours()+":"+now.getMinutes();
			} else {
				if(now.getMinutes() < 10) {
					document.getElementById("timeFilter").value = now.getHours()+":0"+now.getMinutes();	
				} else {
					document.getElementById("timeFilter").value = now.getHours()+":"+now.getMinutes();
				}
				appliedFilters.time = now.getHours()+":"+now.getMinutes();
			}
			pullRooms();
			return;
		} else if(type.hasClass("durationFilters")) {
			$("#slider-range").slider( "values", 0, 0);
			$("#slider-range").slider( "values", 1, 600);
			
			appliedFilters.lowerRange = $("#slider-range").slider( "values", 0);
			appliedFilters.upperRange = $("#slider-range").slider( "values", 1);
			
			$("#duration #min").html("0 min");
			$("#duration #max").html("10 hr");
			refreshFilters(); //refresh the global filters
			return;
		} else if(type.hasClass("buildingChecks")) {
			$(".buildingChecks .checkOption").find(':checked').each(function() {
				$(this).removeAttr('checked');
			});
			appliedFilters.buildings = [];
			refreshFilters(); //refresh the global filters
			return;
		} else if(type.hasClass("roomChecks")) {
			$(".roomChecks .checkOption").find(':checked').each(function() {
				$(this).removeAttr('checked');
			});
			appliedFilters.rooms = [];
			refreshFilters(); //refresh the global filters
			return;
		} else if(type.hasClass("allFilters")) {
			$("#datepicker").datepicker("setDate", (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()));
			appliedFilters.date = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
			
			if(now.getHours() < 10) {
				if(now.getMinutes() < 10) {
					document.getElementById("timeFilter").value = "0"+now.getHours()+":0"+now.getMinutes();
				} else {
					document.getElementById("timeFilter").value = "0"+now.getHours()+":"+now.getMinutes();	
				}
				appliedFilters.time = "0"+now.getHours()+":"+now.getMinutes();
			} else {
				if(now.getMinutes() < 10) {
					document.getElementById("timeFilter").value = now.getHours()+":0"+now.getMinutes();
				} else {
					document.getElementById("timeFilter").value = now.getHours()+":"+now.getMinutes();
				}
				appliedFilters.time = now.getHours()+":"+now.getMinutes();
			}
			
			$("#slider-range").slider( "values", 0, 0);
			$("#slider-range").slider( "values", 1, 600);
			
			appliedFilters.lowerRange = $("#slider-range").slider( "values", 0);
			appliedFilters.upperRange = $("#slider-range").slider( "values", 1);
			
			$("#duration #min").html("0 min");
			$("#duration #max").html("10 hr");
			
			$(".buildingChecks .checkOption").find(':checked').each(function() {
				$(this).removeAttr('checked');
			});
			appliedFilters.buildings = [];
			
			$(".roomChecks .checkOption").find(':checked').each(function() {
				$(this).removeAttr('checked');
			});
			appliedFilters.rooms = [];
			
			if(prevDate != (now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate())) {
				if(availableRooms.length == 0) {
					$("tbody").append("<tr><td>Sorry, 404 Rooms Not Found.</td></tr>");
				}
				pullRooms();
				return;
			}
		}
		
	});
});

function createCheckBoxes(options, parent, type) {
	options.forEach(function(element, index) {
		$("."+parent).append("<li class=\"checkOption\"><label><input id="+element+" name="+element+" type=\"checkbox\">"+element+"</label></li>");
		$("#"+element).on("change", function() {
			addFilter(element, type);
		});
	});
}

function addFilter(element, type) {
	if(appliedFilters[type].indexOf(element) == -1) {
		appliedFilters[type].push(element);
	} else {
		appliedFilters[type].splice(appliedFilters[type].indexOf(element), 1);
	}
	refreshFilters();
}

function refreshFilters() {
	filteredRooms = availableRooms.filter(filterRooms);
	
	$("tbody").fadeOut("slow").promise().done(function() {
		$(this).html("");
		setTimeout(function() {
			if(filteredRooms.length > 0) {
				filteredRooms.forEach(function(element) {
					var hours = parseInt(element.remaining / 60);
					var mins = parseInt(element.remaining) % 60;
				    var remaining;
				    if(hours < 1) {
						remaining = mins + " min";
				    } else {
						if(mins < 1) {    
					    	remaining = hours + " hr";
					    } else {
						    remaining = hours + " hr " + mins + " min";
					    }
				    }
			    
					$("tbody").append("<tr><td><span>"+element.building+"</span></td><td><span>"+element.room_num+"</span></td><td><span class=\"hide\">"+element.type+"</span><img src=\""+roomTypeImages[element.type]+"\" width=\"20\" /></td><td><span class=\"hide\">"+element.remaining+"</span>"+remaining+"<div class=\"progress\"><span class=\"meter\" style=\"width:"+Math.floor(100 * element.remaining / element.maxRemaining)+"%\"></span></div></div></td></tr>");
				});
				/*
$("#availableRooms").tablesorter({
					sortList: [[3,1]],
					textExtraction: function(node) { 
			            return node.childNodes[0].innerHTML; 
			        }
				});
*/
			} else {
				$("tbody").append("<tr><td colspan=\"4\"><div class=\"panel callout\"><h5>Room 404 not Found</h5><p>Adjust filters on the left.</p></div></td></tr>");
			}
			
			$("tbody").fadeIn("slow");
		}, 500);
	});
}

function filterRooms(element) {
	var flag = false;
	//Checks if no building filter or apply only chosen
	if(appliedFilters["buildings"].length == 0 || appliedFilters["buildings"].indexOf(element.building) != -1) {
		flag = true;
	}
	
	if(flag) {
		if(appliedFilters["rooms"].length == 0 || appliedFilters["rooms"].indexOf(element.type) != -1) {
			flag = true;	
		} else {
			flag = false;
		}
	}
	
	if(flag) {
		if(parseInt(element.remaining) >= appliedFilters["lowerRange"] && parseInt(element.remaining) <= appliedFilters["upperRange"]) {
			flag = true;
		} else {
			flag = false;
		}
	}
	
	return flag;
}

function pullRooms() {
	$(".buildingChecks").html("<li><label>Buildings<span>Clear</span></label></li>");
	$(".roomChecks").html("<li><label>Types<span>Clear</span></label></li>");
	$("tbody").html("");
	availableRooms = [];
	buildingOptions = [];
	roomTypeOptions = [];
	appliedFilters.buildings = [];
	appliedFilters.rooms = [];
	
	$.ajax({
		url: "http://e-wit.co.uk/gyngai/labcrasher/getAvailabilities/"+appliedFilters.date+"/"+appliedFilters.time
	}).done(function(data) {
		data.forEach(function(element) {
			availableRooms.push(element);
			if(buildingOptions.indexOf(element.building) == -1)
				buildingOptions.push(element.building);
			if(roomTypeOptions.indexOf(element.type) == -1)
				roomTypeOptions.push(element.type);
		});
		
		buildingOptions.sort();
		roomTypeOptions.sort();
		createCheckBoxes(buildingOptions, "buildingChecks", "buildings");
		createCheckBoxes(roomTypeOptions, "roomChecks", "rooms");
		
		refreshFilters();
	});
}