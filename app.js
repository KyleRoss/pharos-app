var app = (function()
{
    // Application object.
    var app = {};

    // Dictionary of beacons.
    var beacons = {};

    // RSSI holder
    var rssiArr = [];

    // declare scanner variable so we can stop it later
    var scanner;

    // mapping object
    var mapper = {};

    // location object
    var location = {
        lastSeen: '',
        checkedIn: '',
        checkinCount: 0
    }
    
    // Beacon Dictionary 
    var beaconDict = {
        'd189a0c52792': {
            area:'Coffee',
            strength: 12
        },
        'e7ec3a70f494': {
            area: 'Speed trumps perfection',
            strength: 15
        },
        'dd321238f590': {
            area: 'Inputs',
            strength: 15
        }, //left side
        'c6046054f60c': {
            area: 'Inputs',
            strength: 15
        }, //right side
        'c9544e7e2cae': {
            area: 'Disrupt',
            strength: 12
        },
        'dfc66e3d9a73': {
            area: 'Disrupt',
            strength: 12
        }
    };
    
    //checkin array
    var checkIn = [];
    // Timer that displays list of beacons.
    var updateTimer = null;

    app.initialize = function()
    {
        document.addEventListener(
            'deviceready',
            function() { evothings.scriptsLoaded(onDeviceReady) },
            false);
    };

    function onDeviceReady()
    {
        // Start tracking beacons!
        //setTimeout(startScan, 100);
        var button = $(
            '<button id="mapButton" onclick="app.roomMap()">Map Room</button>'
        );
        $('#message').empty();
        $('#message').after(button);

        // Display refresh timer.
        //updateTimer = setInterval(displayBeaconList, 500);
        //updateTimer = setInterval(roomMap, 500);
    }

    function startScan()
    {
        // Called continuously when ranging beacons.
        evothings.eddystone.startScan(
            function(beacon)
            {
                // Insert/update beacon table entry.
                beacon.timeStamp = Date.now();
                if (beacon.bid) {
                    
                    if (!mapper[uint8ArrayToString(beacon.bid)]) {
                        mapper[uint8ArrayToString(beacon.bid)] = []
                    } else {
                        if (beacon.rssi < 0)
                            mapper[uint8ArrayToString(beacon.bid)].push(mapBeaconRSSI(beacon.rssi));
                        if(mapper[uint8ArrayToString(beacon.bid)].length > 5) {
                            mapper[uint8ArrayToString(beacon.bid)].shift();
                        }
                    }
                    beacons[uint8ArrayToString(beacon.bid)] = beacon;
                }

            },
            function(error)
            {
                console.log('Eddystone Scan error: ' + JSON.stringify(error));
            });
        for (var key in mapper) {
            if(!beacons[key]) delete mapper[key];
        }
    }

    /**
     * Map the RSSI value to a value between 1 and 100.
     */
    function mapBeaconRSSI(rssi)
    {
        if (rssi >= 0) return 1; // Unknown RSSI maps to 1.
        if (rssi < -100) return 100; // Max RSSI
        return 100 + rssi;
    }

    function getSortedBeaconList(beacons)
    {
        var beaconList = [];
        for (var key in beacons)
        {
            beaconList.push(beacons[key]);
        }
        beaconList.sort(function(beacon1, beacon2)
        {
            return mapBeaconRSSI(beacon1.rssi) < mapBeaconRSSI(beacon2.rssi);
        });
        return beaconList;
    }

    app.stopMapping = function() {
        clearTimeout(scanner);
        var button = $(
            '<button id="mapButton" onclick="app.roomMap()">Map Room</button>'
        );
        $('#stopButton').remove();
        $('#message').append(button);
    }

    app.roomMap = function() {
        //make the stop button
        var button = $(
            '<button id="stopButton" onclick="app.stopMapping()">Stop</button>'
        );
        $('#mapButton').remove();
        $('#message').append(button);

        //get a fresh mapper object
        mapper = {};
        // start collecting data

        var timeNow = Date.now();
        scanner = setInterval(function() {
            var count = 0;
            $('#found-beacons').empty();
            startScan();
            var packet = [];
            var data = '';
            for (var key in mapper) {
                
                if (mapper.hasOwnProperty(key)) {
                    if (mapper[key].length) {
                        
                        var sum = 0;
                        for(var i = 0; i < mapper[key].length; i++) {
                            sum += mapper[key][i];
                        }
                        if (sum) sum = sum / mapper[key].length;
                        data += key + ':' + sum.toFixed(1) + ' ';
                        packet.push([key, sum.toFixed(1)]);
                        
                    }
                }
            }
            
            packet = packet.sort(function(a, b) {
              return a[1] - b[1];
            });
            if (beaconDict[packet[packet.length - 1][0]]) {
                var current = beaconDict[packet[packet.length - 1][0]];
                if (checkIn.length > 20) checkIn.shift();
                if (packet[packet.length - 1][1] > current.strength){
                  checkIn.push(current.area);
                } else {
                    checkIn.push(null);
                }

                if (location.lastSeen === current.area) {
                    
                } else {
                    location.lastSeen = current.area;
                    
                    //insert ajax to set last seen
                }
                
                for (var key in beacons) {
                    count = 0;
                    for (var i = 0; i<checkIn.length; i++) {
                        if (beaconDict[key].area === checkIn[i]) count++;
                     }
                     if (count > 12) {
                       location.checkedIn = current.area;
                       
                       //check in ajax here
                     } else if (count < 8 && beaconDict[key].area === location.checkedIn) {
                       location.checkedIn = '';
                       //check out ajax here
                     }
                }
        
            } else {
                //insert ajax to set last seen and insert bid and roomName in beaconDict
                //and set location.lastSeen to roomName
            }
            
            var listItem = $(
                '<li>' + JSON.stringify(mapper) + '</li>'
            );
            
            $('#message').empty().append('Last Seen: ' + location.lastSeen);
            $('#message').append('<br />Count: ' + count);
            $('#message').append('<br />Checked In: ' + location.checkedIn);
            $('#message').append('<br />Check In: ' + checkIn);
            $('#found-beacons').append(listItem);
            
        }, 1000);

    };

    function displayBeaconList()
    {
        var timeNow = Date.now();

        var bl = getSortedBeaconList(beacons);

        //$.each(bl), function(index, beacon) {
        //  if (beacon.timeStamp + 60000 > timeNow) {
        //      mapper[beacon.bid] ? mapper[beacon.bid].push(beacon.rssi): mapper[beacon.bid] = [];
        //  }
        //};


        // Clear beacon display list.
        $('#found-beacons').empty();

        // Update beacon display list.
        $.each(getSortedBeaconList(beacons), function(index, beacon)
        {
            // Only show beacons that are updated during the last 60 seconds.
            if (beacon.timeStamp + 60000 > timeNow)
            {
                // Create HTML to display beacon data.
                var element = $(
                    '<li>'
                    + mapper[beacon.bid]
                    +   htmlBeaconName(beacon)
                    +   htmlBeaconURL(beacon)
                    +   htmlBeaconNID(beacon)
                    +   htmlBeaconBID(beacon)
                        //+ htmlBeaconVoltage(beacon)
                        //+ htmlBeaconTemperature(beacon)
                        //+ htmlBeaconTxPower(beacon)
                        //+ htmlBeaconAdvCnt(beacon)
                        //+ htmlBeaconDsecCnt(beacon)
                    +   htmlBeaconRSSI(beacon)
                    +   htmlBeaconRSSIBar(beacon)
                    + '</li>'
                );

                
                $('#found-beacons').append(element);
            }
            if (bl.length && $('#nearestbeacon').length === 0) {
                $('h1').after('<p id="nearestbeacon">Nearest Beacon: ' + uint8ArrayToString(bl[0].bid)+'</p>');

            }
            if (!$('#msger').length) $('#nearestbeacon').after('<h1 id="msger">Nothing</h1>');
            if (bl[0].name === 'C02Q410DG8WM') {
                if (bl[0].rssi > -99) rssiArr.push(bl[0].rssi);
                if(rssiArr.length > 10) rssiArr.shift();
                if (rssiArr.length === 10) {
                    var sum = 0;
                    for (var i = 0; i < rssiArr.length; i++) {
                        sum += rssiArr[i];
                    }
                    if (sum/rssiArr.length > -60) {
                        $('#msger').remove();
                        $('#nearestbeacon').after('<p id="msger">Welcome Back!</p>');

                    } else {
                        $('#msger').remove();
                        $('#nearestbeacon').after('<p id="msger">' + sum/rssiArr.length + '</p>');
                    }
                }
                //$('#msger').innerText(rssiArr.length);
            }

        });
    }

    function htmlBeaconName(beacon)
    {
        return beacon.name ?
        '<strong>' + beacon.name + '</strong><br/>' :  '';
    }

    function htmlBeaconURL(beacon)
    {
        return beacon.url ?
        'URL: ' + beacon.url + '<br/>' :  '';
    }

    function htmlBeaconURL(beacon)
    {
        return beacon.url ?
        'URL: ' + beacon.url + '<br/>' :  '';
    }

    function htmlBeaconNID(beacon)
    {
        return beacon.nid ?
        'NID: ' + uint8ArrayToString(beacon.nid) + '<br/>' :  '';
    }

    function htmlBeaconBID(beacon)
    {
        return beacon.bid ?
        'BID: ' + uint8ArrayToString(beacon.bid) + '<br/>' :  '';
    }

    function htmlBeaconVoltage(beacon)
    {
        return beacon.voltage ?
        'Voltage: ' + beacon.voltage + '<br/>' :  '';
    }

    function htmlBeaconTemperature(beacon)
    {
        return beacon.temperature && beacon.temperature != 0x8000 ?
        'Temperature: ' + beacon.temperature + '<br/>' :  '';
    }
    function htmlBeaconTxPower(beacon)
    {
        return beacon.txPower ?
        'TxPower: ' + beacon.txPower + '<br/>' :  '';
    }

    function htmlBeaconAdvCnt(beacon)
    {
        return beacon.adv_cnt ?
        'ADV_CNT: ' + beacon.adv_cnt + '<br/>' :  '';
    }

    function htmlBeaconDsecCnt(beacon)
    {
        return beacon.dsec_cnt ?
        'DSEC_CNT: ' + beacon.dsec_cnt + '<br/>' :  '';
    }

    function htmlBeaconRSSI(beacon)
    {
        return beacon.rssi ?
        'RSSI: ' + beacon.rssi + '<br/>' :  '';
    }

    function htmlBeaconRSSIBar(beacon)
    {
        return beacon.rssi ?
        '<div style="background:rgb(255,64,128);height:20px;width:'
        + mapBeaconRSSI(beacon.rssi) + '%;"></div>' : '';
    }

    function uint8ArrayToString(uint8Array)
    {
        function format(x)
        {
            var hex = x.toString(16);
            return hex.length < 2 ? '0' + hex : hex;
        }

        var result = '';
        for (var i = 0; i < uint8Array.length; ++i)
        {
            result += format(uint8Array[i]) + '';
        }
        return result;
    }

    return app;
})();

app.initialize();
