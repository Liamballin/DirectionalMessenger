     function inter(
             val, //current value
             min1, //start of range that value is in
             max1, //end of range that value is in
             min2, //start of range to convert value to
             max2 //end of range to convert value to
            ) 
            {
            var res = min2 + (max2 - min2) * ((val - min1) / (max1 - min1));
            return res;
            }



        var alpha;
        window.addEventListener('deviceorientation', function(event) {
            if (typeof event.webkitCompassHeading !== "undefined") {
        alpha = event.webkitCompassHeading; //iOS non-standard
        var heading = alpha
        document.getElementById("heading").innerHTML = heading.toFixed([0])+"°";
        rotate(alpha)
    }
      else {
        alert("Your device is reporting relative alpha values, so this compass won't point north! ");
        var heading = 360 - alpha; //heading [0, 360)
        document.getElementById("heading").innerHTML = heading.toFixed([0]);
      }

    // if (window.DeviceOrientationAbsoluteEvent) {
    //   window.addEventListener("DeviceOrientationAbsoluteEvent", deviceOrientationListener);
    // } // If not, check if the device sends any orientation data
    // else if(window.DeviceOrientationEvent){
    //   window.addEventListener("deviceorientation", deviceOrientationListener);
    // } // Send an alert if the device isn't compatible
    // else {
    //   alert("Sorry, try again on a compatible mobile device!");
    // }
      
        var message = document.getElementById('testMessage');
        var messageAngle = 100;

        var distance = Math.floor(Math.abs(alpha-messageAngle))

        // if(distance < 10){
        //     document.getElementById('testMessage').style.opacity = inter(distance,0,10,1,0);//innerHTML = distance//style.opacity = str(inter(Math.abs(alpha-messageAngle),0,10,0,1));
        // }else{
        //     document.getElementById('testMessage').style.opacity = 0;//innerHTML = "Test message";
        // }

   

})  

    function rotate(deg){
        var div = document.getElementById("compassRing")
        div.style.webkitTransform = 'rotate('+deg+"deg)"


    }