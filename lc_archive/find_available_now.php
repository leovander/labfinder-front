<?php
  //ini_set( 'display_errors', 0 );
  date_default_timezone_set('America/Los_Angeles');
  require_once("simple_html_dom.php");
  require_once("helper_functions.php");
  
  
  //$majors = array("CHzE", "CzE", "CECS", "CEM", "EzE", "ENGR", "EzT", "MAE");
  $majors = array("CHzE", "CEM");
  
  foreach ($majors as $major) {
	  $schedule = getClassSchedule($major);
	 //  foreach ($schedule as $sched) {
		// print("<pre>"); 
	 //  	print_r($sched); 
	 //  	print("</pre>"); 
	 //  }
	  print("<pre>"); 
	  print_r($schedule);
	  print("</pre>"); 
	  //array_merge($schedule, $schedule); 
	   // sortTimes($schedule);
	   // calculateVacancy($schedule);
	  //$available = findAvailableNow ($schedule);
	  
	  // file_put_contents("COE/".$major."_available.json", json_encode($schedule));
  }

  // sortTimes($schedule);
  // calculateVacancy($schedule);
  // file_put_contents("COE/all_available_CHzE_CEM.json", json_encode($schedule));
  
  function calculateVacancy(&$schedule) {  
	  //Find vacant time from the occupied time
	  foreach ($schedule as $sched) {
		  foreach ($sched as $dkey => $day) {
		    foreach ($day as $ckey => $class) {
		      foreach ($class["occupied"] as $okey => $occupied) {
		      	if ($okey==0 && $occupied["start"] > date('H:i', strtotime("08:00"))) {
			        array_push($schedule[$sched][$dkey][$ckey]["vacant"],
			        					array("start" => date('H:i', strtotime("08:00")),
		    	    						  "end" => $occupied["start"]));
			    } elseif ($okey+1 <= sizeof($schedule[$sched][$dkey][$ckey]["occupied"])-1) {
			        array_push($schedule[$sched][$dkey][$ckey]["vacant"],
			        					array("start" => $occupied["end"],
		    	    						  "end" => $schedule[$dkey][$ckey]["occupied"][$okey+1]["start"]));
		        } else {
		        	array_push($schedule[$sched][$dkey][$ckey]["vacant"],
			        					array("start" => $occupied["end"],
		    	    						  "end" => date('H:i', strtotime("23:00"))));
		        }
		      }
		    }
		  }	
		}
  }

  function sortTimes(&$schedule = array()) {
	  foreach($schedule as $sched) {
		  foreach($sched as $dkey => $day) {
		    foreach($day as $ckey => $class) {
		      $occupied = $schedule[$sched][$dkey][$ckey];
		      $schedule[$sched][$dkey][$ckey] = null;
		      $schedule[$sched][$dkey][$ckey]["occupied"] = $occupied;
		      $schedule[$sched][$dkey][$ckey]["vacant"] = array();
		    }
		  }
	  }
	  
	  foreach ($schedule as $sched) {
		  foreach ($sched as $dkey => $day) {
		    foreach ($day as $ckey => $class) {
		      usort($schedule[$sched][$dkey][$ckey]["occupied"], "cmp");
		    }
		  }
	  }
  }

  function getClassSchedule($major) {
	  $html = file_get_html('http://www.csulb.edu/depts/enrollment/registration/class_schedule/Fall_2014/By_College/'.$major.'.html');
	  $ret = $html->find('.sectionTable');
	  
	  $building = new stdClass(); 
	
	  $today = getdate();
	  
	  foreach($ret AS $table) {
	    $rows = $table->find('tr');
	    $count = 0;
	
	    foreach($rows AS $row) {
	      if($count != 0) {
	        $room = $row->children(7)->innertext; 
	        $time = $row->children(5)->innertext;
	        $days = $row->children(4)->innertext;
	        $type = $row->children(3)->innertext; 
	
	        $time = explode("-", $time);
	        $room = explode("-", $room); 
	        $roomNum = $room[1]; 
	        if (!isset($building->{$room[0]})) {
	        	$building->{$room[0]} = new stdClass(); 
	        }
	
	        if (isset($time[1]) && isset($time[0])) {
	          //Logic to append 'AM' or 'PM' to the start and end time
	          if (substr($time[1], -2) == 'AM') {
	            $time[0] = $time[0].'AM';
	          } else {
	            if (preg_match('/12?/', $time[1]) && preg_match('/1(0|1)/', $time[0])) {
	              $time[0] = $time[0].'AM';
	            } else {
	              $time[0] = $time[0].'PM';
	            }
	          }
	
	          //Convert start time and end time to time object
	          $time[0] = date('H:i', strtotime($time[0]));
	          $time[1] = date('H:i', strtotime($time[1]));
	        }
	
	        preg_match_all('/(M|Tu|W|Th|F)/', $days, $matches);
	        foreach($matches[0] AS $match) {
	          switch($match) {
	            case 'M':
	            	if(isset($building->$room[0]->$room[1])) { 
	            		array_push($building->$room[0]->$room[1], array('day' => 'Monday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
	            	} else {
	            		$building->$room[0]->$room[1] = array(); 
	            		array_push($building->$room[0]->$room[1], array('day' => 'Monday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
	            	}
	            break;
	            case 'Tu':
	              	if(isset($building->$room[0]->$room[1])) { 
	              		array_push($building->$room[0]->$room[1], array('day' => 'Tuesday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
	              	} else {
	              		$building->$room[0]->$room[1] = array(); 
	              		array_push($building->$room[0]->$room[1], array('day' => 'Tuesday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
	              	}
	            break;
	            case 'W':
		            if(isset($building->$room[0]->$room[1])) { 
		            	array_push($building->$room[0]->$room[1], array('day' => 'Wednesday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
		        	} else {
		        		$building->$room[0]->$room[1] = array(); 
		        		array_push($building->$room[0]->$room[1], array('day' => 'Wednesday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
		        	}
	            break;
	            case 'Th':
	              	if(isset($building->$room[0]->$room[1])) { 
	              		array_push($building->$room[0]->$room[1], array('day' => 'Thursday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
	              	} else {
	              		$building->$room[0]->$room[1] = array(); 
	              		array_push($building->$room[0]->$room[1], array('day' => 'Thursday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
	              	}
	            break;
	            default:
		            if(isset($building->$room[0]->$room[1])) { 
		            	array_push($building->$room[0]->$room[1], array('day' => 'Friday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
		        	} else {
		        		$building->$room[0]->$room[1] = array(); 
		        		array_push($building->$room[0]->$room[1], array('day' => 'Friday', 'source' => $major, 'type' => $type, 'start' => $time[0],'end' => $time[1]));	
		        	}
	            break;
	          }
	        }
	      }
	      $count++;
	    }
	  }
	  //return $building;
	  return object_to_array($building);
  }
  
  function findAvailableNow ($schedule) {
	  $today = getdate(); 
	  $now = date('H:i', strtotime($today["hours"].':'.$today["minutes"]));
	  $available = new stdClass(); 
	  
	  foreach ($schedule[$today["weekday"]] as $ckey => $class) {
	    $building = split('-', $ckey);
		if(!isset($available->$building[0])) {
		  $available->$building[0] = array(); 	
		}

        foreach ($class["vacant"] as $vkey => $vacant) {
	      if ($now >= $vacant["start"] && $now <= $vacant["end"]) {
	        
		    array_push($available->$building[0], array('room' => $ckey, 'start' => $vacant["start"], 'end' => $vacant["end"]));
		    break;
	      }
	    }
	  }
	  return object_to_array($available);
  }
?>
