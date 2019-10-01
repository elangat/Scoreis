(function(){
    function array_keys (input, search_value, argStrict) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
        // *     returns 1: {0: 'firstname', 1: 'surname'}

        var tmp_arr = {}, strict = !!argStrict, include = true, cnt = 0;
        var key = '';

        for (key in input) {
            include = true;
            if (search_value != undefined) {
                if (strict && input[key] !== search_value){
                    include = false;
                } else if (input[key] != search_value){
                    include = false;
                }
            }

            if (include) {
                tmp_arr[cnt] = key;
                cnt++;
            }
        }

        return tmp_arr;
    }

    function array_values (input) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: array_values( {firstname: 'Kevin', surname: 'van Zonneveld'} );
        // *     returns 1: {0: 'Kevin', 1: 'van Zonneveld'}

        var tmp_arr = [], cnt = 0;
        var key = '';

        for ( key in input ){
            tmp_arr[cnt] = input[key];
            cnt++;
        }

        return tmp_arr;
    }

    function array_product ( input ) {
        // http://kevin.vanzonneveld.net
        // +   original by: Waldo Malqui Silva
        // *     example 1: array_product([ 2, 4, 6, 8 ]);
        // *     returns 1: 384

        var Index = 0, product = 1;
        if ( input instanceof Array ) {
            while ( Index < input.length ) {
                product *= ( !isNaN( input [ Index ] ) ? input [ Index ] : 0 );
                Index++;
            }
        } else {
            product = null;
        }

        return product;
    }

    function in_array (needle, haystack, argStrict) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: vlado houba
        // +   input by: Billy
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
        // *     returns 1: true
        // *     example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
        // *     returns 2: false
        // *     example 3: in_array(1, ['1', '2', '3']);
        // *     returns 3: true
        // *     example 3: in_array(1, ['1', '2', '3'], false);
        // *     returns 3: true
        // *     example 4: in_array(1, ['1', '2', '3'], true);
        // *     returns 4: false

        var key = '', strict = !!argStrict;

        if (strict) {
            for (key in haystack) {
                if (haystack[key] === needle) {
                    return true;
                }
            }
        } else {
            for (key in haystack) {
                if (haystack[key] == needle) {
                    return true;
                }
            }
        }

        return false;
    }

    function date(format, timestamp) {
        // http://kevin.vanzonneveld.net
        // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
        // +      parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: MeEtc (http://yass.meetcweb.com)
        // +   improved by: Brad Touesnard
        // +   improved by: Tim Wiel
        // +   improved by: Bryan Elliott
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: David Randall
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Theriault
        // +  derived from: gettimeofday
        // +      input by: majak
        // +   bugfixed by: majak
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Alex
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Theriault
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Theriault
        // +   improved by: Thomas Beaucourt  (http://www.webapp.fr)
        // +   improved by: JT
        // +   improved by: Theriault
        // %        note 1: Uses global: php_js to store the default timezone
        // *     example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
        // *     returns 1: '09:09:40 m is month'
        // *     example 2: date('F j, Y, g:i a', 1062462400);
        // *     returns 2: 'September 2, 2003, 2:26 am'
        // *     example 3: date('Y W o', 1062462400);
        // *     returns 3: '2003 36 2003'
        // *     example 4: x = date('Y m d', (new Date()).getTime()/1000);
        // *     example 4: (x+'').length == 10 // 2009 01 09
        // *     returns 4: true
        // *     example 5: date('W', 1104534000);
        // *     returns 5: '53'
        // *     example 6: date('B t', 1104534000);
        // *     returns 6: '999 31'
        // *     example 7: date('W', 1293750000); // 2010-12-31
        // *     returns 7: '52'
        // *     example 8: date('W', 1293836400); // 2011-01-01
        // *     returns 8: '52'
        // *     example 9: date('W Y-m-d', 1293974054); // 2011-01-02
        // *     returns 9: '52 2011-01-02'
        var that = this,
            jsdate, f, formatChr = /\\?([a-z])/gi, formatChrCb,
            // Keep this here (works, but for code commented-out
            // below for file size reasons)
            //, tal= [],
            _pad = function (n, c) {
                if ((n = n + "").length < c) {
                    return new Array((++c) - n.length).join("0") + n;
                } else {
                    return n;
                }
            },
            txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur",
            "January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"],
            txt_ordin = {
                1: "st",
                2: "nd",
                3: "rd",
                21: "st",
                22: "nd",
                23: "rd",
                31: "st"
            };
        formatChrCb = function (t, s) {
            return f[t] ? f[t]() : s;
        };
        f = {
        // Day
            d: function () { // Day of month w/leading 0; 01..31
                return _pad(f.j(), 2);
            },
            D: function () { // Shorthand day name; Mon...Sun
                return f.l().slice(0, 3);
            },
            j: function () { // Day of month; 1..31
                return jsdate.getDate();
            },
            l: function () { // Full day name; Monday...Sunday
                return txt_words[f.w()] + 'day';
            },
            N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
                return f.w() || 7;
            },
            S: function () { // Ordinal suffix for day of month; st, nd, rd, th
                return txt_ordin[f.j()] || 'th';
            },
            w: function () { // Day of week; 0[Sun]..6[Sat]
                return jsdate.getDay();
            },
            z: function () { // Day of year; 0..365
                var a = new Date(f.Y(), f.n() - 1, f.j()),
                    b = new Date(f.Y(), 0, 1);
                return Math.round((a - b) / 864e5) + 1;
            },

        // Week
            W: function () { // ISO-8601 week number
                var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                    b = new Date(a.getFullYear(), 0, 4);
                return 1 + Math.round((a - b) / 864e5 / 7);
            },

        // Month
            F: function () { // Full month name; January...December
                return txt_words[6 + f.n()];
            },
            m: function () { // Month w/leading 0; 01...12
                return _pad(f.n(), 2);
            },
            M: function () { // Shorthand month name; Jan...Dec
                return f.F().slice(0, 3);
            },
            n: function () { // Month; 1...12
                return jsdate.getMonth() + 1;
            },
            t: function () { // Days in month; 28...31
                return (new Date(f.Y(), f.n(), 0)).getDate();
            },

        // Year
            L: function () { // Is leap year?; 0 or 1
                var y = f.Y(), a = y & 3, b = y % 4e2, c = y % 1e2;
                return 0 + (!a && (c || !b));
            },
            o: function () { // ISO-8601 year
                var n = f.n(), W = f.W(), Y = f.Y();
                return Y + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
            },
            Y: function () { // Full year; e.g. 1980...2010
                return jsdate.getFullYear();
            },
            y: function () { // Last two digits of year; 00...99
                return (f.Y() + "").slice(-2);
            },

        // Time
            a: function () { // am or pm
                return jsdate.getHours() > 11 ? "pm" : "am";
            },
            A: function () { // AM or PM
                return f.a().toUpperCase();
            },
            B: function () { // Swatch Internet time; 000..999
                var H = jsdate.getUTCHours() * 36e2, // Hours
                    i = jsdate.getUTCMinutes() * 60, // Minutes
                    s = jsdate.getUTCSeconds(); // Seconds
                return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
            },
            g: function () { // 12-Hours; 1..12
                return f.G() % 12 || 12;
            },
            G: function () { // 24-Hours; 0..23
                return jsdate.getHours();
            },
            h: function () { // 12-Hours w/leading 0; 01..12
                return _pad(f.g(), 2);
            },
            H: function () { // 24-Hours w/leading 0; 00..23
                return _pad(f.G(), 2);
            },
            i: function () { // Minutes w/leading 0; 00..59
                return _pad(jsdate.getMinutes(), 2);
            },
            s: function () { // Seconds w/leading 0; 00..59
                return _pad(jsdate.getSeconds(), 2);
            },
            u: function () { // Microseconds; 000000-999000
                return _pad(jsdate.getMilliseconds() * 1000, 6);
            },

        // Timezone
            e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
    // The following works, but requires inclusion of the very large
    // timezone_abbreviations_list() function.
    /*              var abbr = '', i = 0, os = 0;
                if (that.php_js && that.php_js.default_timezone) {
                    return that.php_js.default_timezone;
                }
                if (!tal.length) {
                    tal = that.timezone_abbreviations_list();
                }
                for (abbr in tal) {
                    for (i = 0; i < tal[abbr].length; i++) {
                        os = -jsdate.getTimezoneOffset() * 60;
                        if (tal[abbr][i].offset === os) {
                            return tal[abbr][i].timezone_id;
                        }
                    }
                }
    */
                return 'UTC';
            },
            I: function () { // DST observed?; 0 or 1
                // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
                // If they are not equal, then DST is observed.
                var a = new Date(f.Y(), 0), // Jan 1
                    c = Date.UTC(f.Y(), 0), // Jan 1 UTC
                    b = new Date(f.Y(), 6), // Jul 1
                    d = Date.UTC(f.Y(), 6); // Jul 1 UTC
                return 0 + ((a - c) !== (b - d));
            },
            O: function () { // Difference to GMT in hour format; e.g. +0200
                var a = jsdate.getTimezoneOffset();
                return (a > 0 ? "-" : "+") + _pad(Math.abs(a / 60 * 100), 4);
            },
            P: function () { // Difference to GMT w/colon; e.g. +02:00
                var O = f.O();
                return (O.substr(0, 3) + ":" + O.substr(3, 2));
            },
            T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
    // The following works, but requires inclusion of the very
    // large timezone_abbreviations_list() function.
    /*              var abbr = '', i = 0, os = 0, default = 0;
                if (!tal.length) {
                    tal = that.timezone_abbreviations_list();
                }
                if (that.php_js && that.php_js.default_timezone) {
                    default = that.php_js.default_timezone;
                    for (abbr in tal) {
                        for (i=0; i < tal[abbr].length; i++) {
                            if (tal[abbr][i].timezone_id === default) {
                                return abbr.toUpperCase();
                            }
                        }
                    }
                }
                for (abbr in tal) {
                    for (i = 0; i < tal[abbr].length; i++) {
                        os = -jsdate.getTimezoneOffset() * 60;
                        if (tal[abbr][i].offset === os) {
                            return abbr.toUpperCase();
                        }
                    }
                }
    */
                return 'UTC';
            },
            Z: function () { // Timezone offset in seconds (-43200...50400)
                return -jsdate.getTimezoneOffset() * 60;
            },

        // Full Date/Time
            c: function () { // ISO-8601 date.
                return 'Y-m-d\\Th:i:sP'.replace(formatChr, formatChrCb);
            },
            r: function () { // RFC 2822
                return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
            },
            U: function () { // Seconds since UNIX epoch
                return Math.round(jsdate.getTime() / 1000);
            }
        };
        this.date = function (format, timestamp) {
            that = this;
            jsdate = (
                (typeof timestamp === 'undefined') ? new Date() : // Not provided
                (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
            );
            return format.replace(formatChr, formatChrCb);
        };
        return this.date(format, timestamp);
    }

    function strtotime (str, now) {
        // http://kevin.vanzonneveld.net
        // +   original by: Caio Ariede (http://caioariede.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: David
        // +   improved by: Caio Ariede (http://caioariede.com)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Wagner B. Soares
        // +   bugfixed by: Artur Tchernychev
        // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
        // *     example 1: strtotime('+1 day', 1129633200);
        // *     returns 1: 1129719600
        // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
        // *     returns 2: 1130425202
        // *     example 3: strtotime('last month', 1129633200);
        // *     returns 3: 1127041200
        // *     example 4: strtotime('2009-05-04 08:30:00');
        // *     returns 4: 1241418600

        var i, match, s, strTmp = '', parse = '';

        strTmp = str;
        strTmp = strTmp.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
        strTmp = strTmp.replace(/[\t\r\n]/g, ''); // unecessary chars

        if (strTmp == 'now') {
            return (new Date()).getTime()/1000; // Return seconds, not milli-seconds
        } else if (!isNaN(parse = Date.parse(strTmp))) {
            return (parse/1000);
        } else if (now) {
            now = new Date(now*1000); // Accept PHP-style seconds
        } else {
            now = new Date();
        }

        strTmp = strTmp.toLowerCase();

        var __is =
        {
            day:
            {
                'sun': 0,
                'mon': 1,
                'tue': 2,
                'wed': 3,
                'thu': 4,
                'fri': 5,
                'sat': 6
            },
            mon:
            {
                'jan': 0,
                'feb': 1,
                'mar': 2,
                'apr': 3,
                'may': 4,
                'jun': 5,
                'jul': 6,
                'aug': 7,
                'sep': 8,
                'oct': 9,
                'nov': 10,
                'dec': 11
            }
        };

        var process = function (m) {
            var ago = (m[2] && m[2] == 'ago');
            var num = (num = m[0] == 'last' ? -1 : 1) * (ago ? -1 : 1);

            switch (m[0]) {
                case 'last':
                case 'next':
                    switch (m[1].substring(0, 3)) {
                        case 'yea':
                            now.setFullYear(now.getFullYear() + num);
                            break;
                        case 'mon':
                            now.setMonth(now.getMonth() + num);
                            break;
                        case 'wee':
                            now.setDate(now.getDate() + (num * 7));
                            break;
                        case 'day':
                            now.setDate(now.getDate() + num);
                            break;
                        case 'hou':
                            now.setHours(now.getHours() + num);
                            break;
                        case 'min':
                            now.setMinutes(now.getMinutes() + num);
                            break;
                        case 'sec':
                            now.setSeconds(now.getSeconds() + num);
                            break;
                        default:
                            var day;
                            if (typeof (day = __is.day[m[1].substring(0, 3)]) != 'undefined') {
                                var diff = day - now.getDay();
                                if (diff == 0) {
                                    diff = 7 * num;
                                } else if (diff > 0) {
                                    if (m[0] == 'last') {diff -= 7;}
                                } else {
                                    if (m[0] == 'next') {diff += 7;}
                                }
                                now.setDate(now.getDate() + diff);
                            }
                    }
                    break;

                default:
                    if (/\d+/.test(m[0])) {
                        num *= parseInt(m[0], 10);

                        switch (m[1].substring(0, 3)) {
                            case 'yea':
                                now.setFullYear(now.getFullYear() + num);
                                break;
                            case 'mon':
                                now.setMonth(now.getMonth() + num);
                                break;
                            case 'wee':
                                now.setDate(now.getDate() + (num * 7));
                                break;
                            case 'day':
                                now.setDate(now.getDate() + num);
                                break;
                            case 'hou':
                                now.setHours(now.getHours() + num);
                                break;
                            case 'min':
                                now.setMinutes(now.getMinutes() + num);
                                break;
                            case 'sec':
                                now.setSeconds(now.getSeconds() + num);
                                break;
                        }
                    } else {
                        return false;
                    }
                    break;
            }
            return true;
        };

        match = strTmp.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
        if (match != null) {
            if (!match[2]) {
                match[2] = '00:00:00';
            } else if (!match[3]) {
                match[2] += ':00';
            }

            s = match[1].split(/-/g);

            for (i in __is.mon) {
                if (__is.mon[i] == s[1] - 1) {
                    s[1] = i;
                }
            }
            s[0] = parseInt(s[0], 10);

            s[0] = (s[0] >= 0 && s[0] <= 69) ? '20'+(s[0] < 10 ? '0'+s[0] : s[0]+'') : (s[0] >= 70 && s[0] <= 99) ? '19'+s[0] : s[0]+'';
            return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2])+(match[4] ? match[4]/1000 : ''), 10);
        }

        var regex = '([+-]?\\d+\\s'+
            '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?'+
            '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday'+
            '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)'+
            '|(last|next)\\s'+
            '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?'+
            '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday'+
            '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))'+
            '(\\sago)?';

        match = strTmp.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
        if (match == null) {
            return false;
        }

        for (i = 0; i < match.length; i++) {
            if (!process(match[i].split(' '))) {
                return false;
            }
        }

        return (now.getTime()/1000);
    }

    function print_r (array, return_val) {
        // http://kevin.vanzonneveld.net
        // +   original by: Michael White (http://getsprink.com)
        // +   improved by: Ben Bryan
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +      improved by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: echo
        // *     example 1: print_r(1, true);
        // *     returns 1: 1

        var output = "", pad_char = " ", pad_val = 4, d = this.window.document;
        var getFuncName = function (fn) {
            var name = (/\W*function\s+([\w\$]+)\s*\(/).exec(fn);
            if (!name) {
                return '(Anonymous)';
            }
            return name[1];
        };

        var repeat_char = function (len, pad_char) {
            var str = "";
            for (var i=0; i < len; i++) {
                str += pad_char;
            }
            return str;
        };

        var formatArray = function (obj, cur_depth, pad_val, pad_char) {
            if (cur_depth > 0) {
                cur_depth++;
            }

            var base_pad = repeat_char(pad_val*cur_depth, pad_char);
            var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
            var str = "";

            if (typeof obj === 'object' && obj !== null && obj.constructor && getFuncName(obj.constructor) !== 'PHPJS_Resource') {
                str += "Array\n" + base_pad + "(\n";
                for (var key in obj) {
                    if (obj[key] instanceof Array) {
                        str += thick_pad + "["+key+"] => "+formatArray(obj[key], cur_depth+1, pad_val, pad_char);
                    } else {
                        str += thick_pad + "["+key+"] => " + obj[key] + "\n";
                    }
                }
                str += base_pad + ")\n";
            } else if (obj === null || obj === undefined) {
                str = '';
            } else { // for our "resource" class
                str = obj.toString();
            }

            return str;
        };

        output = formatArray(array, 0, pad_val, pad_char);

        if (return_val !== true) {
            if (d.body) {
                this.echo(output);
            }
            else {
                try {
                    d = XULDocument; // We're in XUL, so appending as plain text won't work; trigger an error out of XUL
                    this.echo('<pre xmlns="http://www.w3.org/1999/xhtml" style="white-space:pre;">'+output+'</pre>');
                }
                catch (e) {
                    this.echo(output); // Outputting as plain text may work in some plain XML
                }
            }
            return true;
        } else {
            return output;
        }
    }

    function echo () {
        // http://kevin.vanzonneveld.net
        // +   original by: Philip Peterson
        // +   improved by: echo is bad
        // +   improved by: Nate
        // +    revised by: Der Simon (http://innerdom.sourceforge.net/)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Eugene Bulkin (http://doubleaw.com/)
        // +   input by: JB
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // %        note 1: If browsers start to support DOM Level 3 Load and Save (parsing/serializing),
        // %        note 1: we wouldn't need any such long code (even most of the code below). See
        // %        note 1: link below for a cross-browser implementation in JavaScript. HTML5 might
        // %        note 1: possibly support DOMParser, but that is not presently a standard.
        // %        note 2: Although innerHTML is widely used and may become standard as of HTML5, it is also not ideal for
        // %        note 2: use with a temporary holder before appending to the DOM (as is our last resort below),
        // %        note 2: since it may not work in an XML context
        // %        note 3: Using innerHTML to directly add to the BODY is very dangerous because it will
        // %        note 3: break all pre-existing references to HTMLElements.
        // *     example 1: echo('<div><p>abc</p><p>abc</p></div>');
        // *     returns 1: undefined

        var arg = '', argc = arguments.length, argv = arguments, i = 0;
        var win = this.window;
        var d = win.document;
        var ns_xhtml = 'http://www.w3.org/1999/xhtml';
        var ns_xul = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'; // If we're in a XUL context

        var holder;

        var stringToDOM = function (str, parent, ns, container) {
            var extraNSs = '';
            if (ns === ns_xul) {
                extraNSs = ' xmlns:html="'+ns_xhtml+'"';
            }
            var stringContainer = '<'+container+' xmlns="'+ns+'"'+extraNSs+'>'+str+'</'+container+'>';
            if (win.DOMImplementationLS &&
                win.DOMImplementationLS.createLSInput &&
                win.DOMImplementationLS.createLSParser) { // Follows the DOM 3 Load and Save standard, but not
                // implemented in browsers at present; HTML5 is to standardize on innerHTML, but not for XML (though
                // possibly will also standardize with DOMParser); in the meantime, to ensure fullest browser support, could
                // attach http://svn2.assembla.com/svn/brettz9/DOMToString/DOM3.js (see http://svn2.assembla.com/svn/brettz9/DOMToString/DOM3.xhtml for a simple test file)
                var lsInput = DOMImplementationLS.createLSInput();
                // If we're in XHTML, we'll try to allow the XHTML namespace to be available by default
                lsInput.stringData = stringContainer;
                var lsParser = DOMImplementationLS.createLSParser(1, null); // synchronous, no schema type
                return lsParser.parse(lsInput).firstChild;
            }
            else if (win.DOMParser) {
                // If we're in XHTML, we'll try to allow the XHTML namespace to be available by default
                try {
                    var fc = new DOMParser().parseFromString(stringContainer, 'text/xml');
                    if (!fc || !fc.documentElement ||
                            fc.documentElement.localName !== 'parsererror' ||
                            fc.documentElement.namespaceURI !== 'http://www.mozilla.org/newlayout/xml/parsererror.xml') {
                        return fc.documentElement.firstChild;
                    }
                    // If there's a parsing error, we just continue on
                }
                catch(e) {
                    // If there's a parsing error, we just continue on
                }
            }
            else if (win.ActiveXObject) { // We don't bother with a holder in Explorer as it doesn't support namespaces
                var axo = new ActiveXObject('MSXML2.DOMDocument');
                axo.loadXML(str);
                return axo.documentElement;
            }
            /*else if (win.XMLHttpRequest) { // Supposed to work in older Safari
                var req = new win.XMLHttpRequest;
                req.open('GET', 'data:application/xml;charset=utf-8,'+encodeURIComponent(str), false);
                if (req.overrideMimeType) {
                    req.overrideMimeType('application/xml');
                }
                req.send(null);
                return req.responseXML;
            }*/
            // Document fragment did not work with innerHTML, so we create a temporary element holder
            // If we're in XHTML, we'll try to allow the XHTML namespace to be available by default
            //if (d.createElementNS && (d.contentType && d.contentType !== 'text/html')) { // Don't create namespaced elements if we're being served as HTML (currently only Mozilla supports this detection in true XHTML-supporting browsers, but Safari and Opera should work with the above DOMParser anyways, and IE doesn't support createElementNS anyways)
            if (d.createElementNS &&  // Browser supports the method
                d.documentElement.namespaceURI && (d.documentElement.namespaceURI !== null || // We can use if the document is using a namespace
                d.documentElement.nodeName.toLowerCase() !== 'html' || // We know it's not HTML4 or less, if the tag is not HTML (even if the root namespace is null)
                (d.contentType && d.contentType !== 'text/html') // We know it's not regular HTML4 or less if this is Mozilla (only browser supporting the attribute) and the content type is something other than text/html; other HTML5 roots (like svg) still have a namespace
            )) { // Don't create namespaced elements if we're being served as HTML (currently only Mozilla supports this detection in true XHTML-supporting browsers, but Safari and Opera should work with the above DOMParser anyways, and IE doesn't support createElementNS anyways); last test is for the sake of being in a pure XML document
                holder = d.createElementNS(ns, container);
            }
            else {
                holder = d.createElement(container); // Document fragment did not work with innerHTML
            }
            holder.innerHTML = str;
            while (holder.firstChild) {
                parent.appendChild(holder.firstChild);
            }
            return false;
            // throw 'Your browser does not support DOM parsing as required by echo()';
        };


        var ieFix = function (node) {
            if (node.nodeType === 1) {
                var newNode = d.createElement(node.nodeName);
                var i, len;
                if (node.attributes && node.attributes.length > 0) {
                    for (i = 0, len = node.attributes.length; i < len; i++) {
                        newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i].nodeName));
                    }
                }
                if (node.childNodes && node.childNodes.length > 0) {
                    for (i = 0, len = node.childNodes.length; i < len; i++) {
                        newNode.appendChild(ieFix(node.childNodes[i]));
                    }
                }
                return newNode;
            }
            else {
                return d.createTextNode(node.nodeValue);
            }
        };

        for (i = 0; i < argc; i++ ) {
            arg = argv[i];
            if (this.php_js && this.php_js.ini && this.php_js.ini['phpjs.echo_embedded_vars']) {
                arg = arg.replace(/(.?)\{\$(.*?)\}/g, function (s, m1, m2) {
                    // We assume for now that embedded variables do not have dollar sign; to add a dollar sign, you currently must use {$$var} (We might change this, however.)
                    // Doesn't cover all cases yet: see http://php.net/manual/en/language.types.string.php#language.types.string.syntax.double
                    if (m1 !== '\\') {
                        return m1+eval(m2);
                    }
                    else {
                        return s;
                    }
                });
            }
            if (d.appendChild) {
                if (d.body) {
                    if (win.navigator.appName == 'Microsoft Internet Explorer') { // We unfortunately cannot use feature detection, since this is an IE bug with cloneNode nodes being appended
                        d.body.appendChild(stringToDOM(ieFix(arg)));
                    }
                    else {
                        var unappendedLeft = stringToDOM(arg, d.body, ns_xhtml, 'div').cloneNode(true); // We will not actually append the div tag (just using for providing XHTML namespace by default)
                        if (unappendedLeft) {
                            d.body.appendChild(unappendedLeft);
                        }
                    }
                } else {
                    d.documentElement.appendChild(stringToDOM(arg, d.documentElement, ns_xul, 'description')); // We will not actually append the description tag (just using for providing XUL namespace by default)
                }
            } else if (d.write) {
                d.write(arg);
            }/* else { // This could recurse if we ever add print!
                print(arg);
            }*/
        }
    }

    function utf8_decode ( str_data ) {
        // http://kevin.vanzonneveld.net
        // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
        // +      input by: Aman Gupta
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Norman "zEh" Fuchs
        // +   bugfixed by: hitwork
        // +   bugfixed by: Onno Marsman
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: utf8_decode('Kevin van Zonneveld');
        // *     returns 1: 'Kevin van Zonneveld'

        var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;

        str_data += '';

        while ( i < str_data.length ) {
            c1 = str_data.charCodeAt(i);
            if (c1 < 128) {
                tmp_arr[ac++] = String.fromCharCode(c1);
                i++;
            } else if ((c1 > 191) && (c1 < 224)) {
                c2 = str_data.charCodeAt(i+1);
                tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = str_data.charCodeAt(i+1);
                c3 = str_data.charCodeAt(i+2);
                tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }

        return tmp_arr.join('');
    }

    function base64_decode (data) {
        // http://kevin.vanzonneveld.net
        // +   original by: Tyler Akins (http://rumkin.com)
        // +   improved by: Thunder.m
        // +      input by: Aman Gupta
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +   bugfixed by: Pellentesque Malesuada
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: utf8_decode
        // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
        // *     returns 1: 'Kevin van Zonneveld'

        // mozilla has this native
        // - but breaks in 2.0.0.12!
        //if (typeof this.window['btoa'] == 'function') {
        //    return btoa(data);
        //}

        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, dec = "", tmp_arr = [];

        if (!data) {
            return data;
        }

        data += '';

        do {  // unpack four hexets into three octets using index points in b64
            h1 = b64.indexOf(data.charAt(i++));
            h2 = b64.indexOf(data.charAt(i++));
            h3 = b64.indexOf(data.charAt(i++));
            h4 = b64.indexOf(data.charAt(i++));

            bits = h1<<18 | h2<<12 | h3<<6 | h4;

            o1 = bits>>16 & 0xff;
            o2 = bits>>8 & 0xff;
            o3 = bits & 0xff;

            if (h3 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1);
            } else if (h4 == 64) {
                tmp_arr[ac++] = String.fromCharCode(o1, o2);
            } else {
                tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
            }
        } while (i < data.length);

        dec = tmp_arr.join('');
        dec = this.utf8_decode(dec);

        return dec;
    }

    function utf8_encode ( argString ) {
        // http://kevin.vanzonneveld.net
        // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: sowberry
        // +    tweaked by: Jack
        // +   bugfixed by: Onno Marsman
        // +   improved by: Yves Sucaet
        // +   bugfixed by: Onno Marsman
        // +   bugfixed by: Ulrich
        // *     example 1: utf8_encode('Kevin van Zonneveld');
        // *     returns 1: 'Kevin van Zonneveld'

        var string = (argString+''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");

        var utftext = "";
        var start, end;
        var stringl = 0;

        start = end = 0;
        stringl = string.length;
        for (var n = 0; n < stringl; n++) {
            var c1 = string.charCodeAt(n);
            var enc = null;

            if (c1 < 128) {
                end++;
            } else if (c1 > 127 && c1 < 2048) {
                enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
            } else {
                enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
            }
            if (enc !== null) {
                if (end > start) {
                    utftext += string.substring(start, end);
                }
                utftext += enc;
                start = end = n+1;
            }
        }

        if (end > start) {
            utftext += string.substring(start, string.length);
        }

        return utftext;
    }

    function base64_encode (data) {
        // http://kevin.vanzonneveld.net
        // +   original by: Tyler Akins (http://rumkin.com)
        // +   improved by: Bayron Guevara
        // +   improved by: Thunder.m
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Pellentesque Malesuada
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // -    depends on: utf8_encode
        // *     example 1: base64_encode('Kevin van Zonneveld');
        // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='

        // mozilla has this native
        // - but breaks in 2.0.0.12!
        //if (typeof this.window['atob'] == 'function') {
        //    return atob(data);
        //}

        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

        if (!data) {
            return data;
        }

        data = this.utf8_encode(data+'');

        do { // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);

            bits = o1<<16 | o2<<8 | o3;

            h1 = bits>>18 & 0x3f;
            h2 = bits>>12 & 0x3f;
            h3 = bits>>6 & 0x3f;
            h4 = bits & 0x3f;

            // use hexets to index into b64, and append result to encoded string
            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        switch (data.length % 3) {
            case 1:
                enc = enc.slice(0, -2) + '==';
            break;
            case 2:
                enc = enc.slice(0, -1) + '=';
            break;
        }

        return enc;
    }

    function trim (str, charlist) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: mdsjack (http://www.mdsjack.bo.it)
        // +   improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
        // +      input by: Erkekjetter
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: DxGx
        // +   improved by: Steven Levithan (http://blog.stevenlevithan.com)
        // +    tweaked by: Jack
        // +   bugfixed by: Onno Marsman
        // *     example 1: trim('    Kevin van Zonneveld    ');
        // *     returns 1: 'Kevin van Zonneveld'
        // *     example 2: trim('Hello World', 'Hdle');
        // *     returns 2: 'o Wor'
        // *     example 3: trim(16, 1);
        // *     returns 3: 6

        var whitespace, l = 0, i = 0;
        str += '';

        if (!charlist) {
            // default list
            whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
        } else {
            // preg_quote custom list
            charlist += '';
            whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
        }

        l = str.length;
        for (i = 0; i < l; i++) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(i);
                break;
            }
        }

        l = str.length;
        for (i = l - 1; i >= 0; i--) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(0, i + 1);
                break;
            }
        }

        return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
    }

    function sprintf ( ) {
        // http://kevin.vanzonneveld.net
        // +   original by: Ash Searle (http://hexmen.com/blog/)
        // + namespaced by: Michael White (http://getsprink.com)
        // +    tweaked by: Jack
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Paulo Ricardo F. Santos
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: sprintf("%01.2f", 123.1);
        // *     returns 1: 123.10
        // *     example 2: sprintf("[%10s]", 'monkey');
        // *     returns 2: '[    monkey]'
        // *     example 3: sprintf("[%'#10s]", 'monkey');
        // *     returns 3: '[####monkey]'

        var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
        var a = arguments, i = 0, format = a[i++];

        // pad()
        var pad = function (str, len, chr, leftJustify) {
            if (!chr) {chr = ' ';}
            var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
            return leftJustify ? str + padding : padding + str;
        };

        // justify()
        var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
            var diff = minWidth - value.length;
            if (diff > 0) {
                if (leftJustify || !zeroPad) {
                    value = pad(value, minWidth, customPadChar, leftJustify);
                } else {
                    value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                }
            }
            return value;
        };

        // formatBaseX()
        var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
            // Note: casts negative numbers to positive ones
            var number = value >>> 0;
            prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
            value = prefix + pad(number.toString(base), precision || 0, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        };

        // formatString()
        var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
            if (precision != null) {
                value = value.slice(0, precision);
            }
            return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
        };

        // doFormat()
        var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
            var number;
            var prefix;
            var method;
            var textTransform;
            var value;

            if (substring == '%%') {return '%';}

            // parse flags
            var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
            var flagsl = flags.length;
            for (var j = 0; flags && j < flagsl; j++) {
                switch (flags.charAt(j)) {
                    case ' ': positivePrefix = ' '; break;
                    case '+': positivePrefix = '+'; break;
                    case '-': leftJustify = true; break;
                    case "'": customPadChar = flags.charAt(j+1); break;
                    case '0': zeroPad = true; break;
                    case '#': prefixBaseX = true; break;
                }
            }

            // parameters may be null, undefined, empty-string or real valued
            // we want to ignore null, undefined and empty-string values
            if (!minWidth) {
                minWidth = 0;
            } else if (minWidth == '*') {
                minWidth = +a[i++];
            } else if (minWidth.charAt(0) == '*') {
                minWidth = +a[minWidth.slice(1, -1)];
            } else {
                minWidth = +minWidth;
            }

            // Note: undocumented perl feature:
            if (minWidth < 0) {
                minWidth = -minWidth;
                leftJustify = true;
            }

            if (!isFinite(minWidth)) {
                throw new Error('sprintf: (minimum-)width must be finite');
            }

            if (!precision) {
                precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
            } else if (precision == '*') {
                precision = +a[i++];
            } else if (precision.charAt(0) == '*') {
                precision = +a[precision.slice(1, -1)];
            } else {
                precision = +precision;
            }

            // grab value using valueIndex if required?
            value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

            switch (type) {
                case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
                case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'i':
                case 'd':
                    number = parseInt(+value, 10);
                    prefix = number < 0 ? '-' : positivePrefix;
                    value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad);
                case 'e':
                case 'E':
                case 'f':
                case 'F':
                case 'g':
                case 'G':
                    number = +value;
                    prefix = number < 0 ? '-' : positivePrefix;
                    method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                    textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                    value = prefix + Math.abs(number)[method](precision);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                default: return substring;
            }
        };

        return format.replace(regex, doFormat);
    }

    function urlencode (str) {
        // http://kevin.vanzonneveld.net
        // +   original by: Philip Peterson
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: AJ
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: travc
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Lars Fischer
        // +      input by: Ratheous
        // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Joris
        // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
        // %          note 1: This reflects PHP 5.3/6.0+ behavior
        // %        note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
        // %        note 2: pages served as UTF-8
        // *     example 1: urlencode('Kevin van Zonneveld!');
        // *     returns 1: 'Kevin+van+Zonneveld%21'
        // *     example 2: urlencode('http://kevin.vanzonneveld.net/');
        // *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
        // *     example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
        // *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

        str = (str+'').toString();

        // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
        // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
                                                                        replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
    }

    function str_pad (input, pad_length, pad_string, pad_type) {
        // http://kevin.vanzonneveld.net
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // + namespaced by: Michael White (http://getsprink.com)
        // +      input by: Marco van Oort
        // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
        // *     example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
        // *     returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
        // *     example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
        // *     returns 2: '------Kevin van Zonneveld-----'
        var half = '',
            pad_to_go;

        var str_pad_repeater = function (s, len) {
            var collect = '',
                i;

            while (collect.length < len) {
                collect += s;
            }
            collect = collect.substr(0, len);

            return collect;
        };

        input += '';
        pad_string = pad_string !== undefined ? pad_string : ' ';

        if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
            pad_type = 'STR_PAD_RIGHT';
        }
        if ((pad_to_go = pad_length - input.length) > 0) {
            if (pad_type == 'STR_PAD_LEFT') {
                input = str_pad_repeater(pad_string, pad_to_go) + input;
            } else if (pad_type == 'STR_PAD_RIGHT') {
                input = input + str_pad_repeater(pad_string, pad_to_go);
            } else if (pad_type == 'STR_PAD_BOTH') {
                half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
                input = half + input + half;
                input = input.substr(0, pad_length);
            }
        }

        return input;
    }
    
    function ucwords (str) {
        // http://kevin.vanzonneveld.net
        // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // +   improved by: Waldo Malqui Silva
        // +   bugfixed by: Onno Marsman
        // +   improved by: Robin
        // +      input by: James (http://www.james-bell.co.uk/)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // *     example 1: ucwords('kevin van  zonneveld');
        // *     returns 1: 'Kevin Van  Zonneveld'
        // *     example 2: ucwords('HELLO WORLD');
        // *     returns 2: 'HELLO WORLD'
        return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
          return $1.toUpperCase();
        });
    }
    
    function get_html_translation_table (table, quote_style) {
      // http://kevin.vanzonneveld.net
      // +   original by: Philip Peterson
      // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: noname
      // +   bugfixed by: Alex
      // +   bugfixed by: Marco
      // +   bugfixed by: madipta
      // +   improved by: KELAN
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
      // +      input by: Frank Forte
      // +   bugfixed by: T.Wild
      // +      input by: Ratheous
      // %          note: It has been decided that we're not going to add global
      // %          note: dependencies to php.js, meaning the constants are not
      // %          note: real constants, but strings instead. Integers are also supported if someone
      // %          note: chooses to create the constants themselves.
      // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
      // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
      var entities = {},
        hash_map = {},
        decimal;
      var constMappingTable = {},
        constMappingQuoteStyle = {};
      var useTable = {},
        useQuoteStyle = {};

      // Translate arguments
      constMappingTable[0] = 'HTML_SPECIALCHARS';
      constMappingTable[1] = 'HTML_ENTITIES';
      constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
      constMappingQuoteStyle[2] = 'ENT_COMPAT';
      constMappingQuoteStyle[3] = 'ENT_QUOTES';

      useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
      useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

      if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error("Table: " + useTable + ' not supported');
        // return false;
      }

      entities['38'] = '&amp;';
      if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;';
        entities['161'] = '&iexcl;';
        entities['162'] = '&cent;';
        entities['163'] = '&pound;';
        entities['164'] = '&curren;';
        entities['165'] = '&yen;';
        entities['166'] = '&brvbar;';
        entities['167'] = '&sect;';
        entities['168'] = '&uml;';
        entities['169'] = '&copy;';
        entities['170'] = '&ordf;';
        entities['171'] = '&laquo;';
        entities['172'] = '&not;';
        entities['173'] = '&shy;';
        entities['174'] = '&reg;';
        entities['175'] = '&macr;';
        entities['176'] = '&deg;';
        entities['177'] = '&plusmn;';
        entities['178'] = '&sup2;';
        entities['179'] = '&sup3;';
        entities['180'] = '&acute;';
        entities['181'] = '&micro;';
        entities['182'] = '&para;';
        entities['183'] = '&middot;';
        entities['184'] = '&cedil;';
        entities['185'] = '&sup1;';
        entities['186'] = '&ordm;';
        entities['187'] = '&raquo;';
        entities['188'] = '&frac14;';
        entities['189'] = '&frac12;';
        entities['190'] = '&frac34;';
        entities['191'] = '&iquest;';
        entities['192'] = '&Agrave;';
        entities['193'] = '&Aacute;';
        entities['194'] = '&Acirc;';
        entities['195'] = '&Atilde;';
        entities['196'] = '&Auml;';
        entities['197'] = '&Aring;';
        entities['198'] = '&AElig;';
        entities['199'] = '&Ccedil;';
        entities['200'] = '&Egrave;';
        entities['201'] = '&Eacute;';
        entities['202'] = '&Ecirc;';
        entities['203'] = '&Euml;';
        entities['204'] = '&Igrave;';
        entities['205'] = '&Iacute;';
        entities['206'] = '&Icirc;';
        entities['207'] = '&Iuml;';
        entities['208'] = '&ETH;';
        entities['209'] = '&Ntilde;';
        entities['210'] = '&Ograve;';
        entities['211'] = '&Oacute;';
        entities['212'] = '&Ocirc;';
        entities['213'] = '&Otilde;';
        entities['214'] = '&Ouml;';
        entities['215'] = '&times;';
        entities['216'] = '&Oslash;';
        entities['217'] = '&Ugrave;';
        entities['218'] = '&Uacute;';
        entities['219'] = '&Ucirc;';
        entities['220'] = '&Uuml;';
        entities['221'] = '&Yacute;';
        entities['222'] = '&THORN;';
        entities['223'] = '&szlig;';
        entities['224'] = '&agrave;';
        entities['225'] = '&aacute;';
        entities['226'] = '&acirc;';
        entities['227'] = '&atilde;';
        entities['228'] = '&auml;';
        entities['229'] = '&aring;';
        entities['230'] = '&aelig;';
        entities['231'] = '&ccedil;';
        entities['232'] = '&egrave;';
        entities['233'] = '&eacute;';
        entities['234'] = '&ecirc;';
        entities['235'] = '&euml;';
        entities['236'] = '&igrave;';
        entities['237'] = '&iacute;';
        entities['238'] = '&icirc;';
        entities['239'] = '&iuml;';
        entities['240'] = '&eth;';
        entities['241'] = '&ntilde;';
        entities['242'] = '&ograve;';
        entities['243'] = '&oacute;';
        entities['244'] = '&ocirc;';
        entities['245'] = '&otilde;';
        entities['246'] = '&ouml;';
        entities['247'] = '&divide;';
        entities['248'] = '&oslash;';
        entities['249'] = '&ugrave;';
        entities['250'] = '&uacute;';
        entities['251'] = '&ucirc;';
        entities['252'] = '&uuml;';
        entities['253'] = '&yacute;';
        entities['254'] = '&thorn;';
        entities['255'] = '&yuml;';
      }

      if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
      }
      if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;';
      }
      entities['60'] = '&lt;';
      entities['62'] = '&gt;';


      // ascii decimals to real symbols
      for (decimal in entities) {
        if (entities.hasOwnProperty(decimal)) {
          hash_map[String.fromCharCode(decimal)] = entities[decimal];
        }
      }

      return hash_map;
    }
    
    function htmlentities (string, quote_style, charset, double_encode) {
      // http://kevin.vanzonneveld.net
      // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: nobbler
      // +    tweaked by: Jack
      // +   bugfixed by: Onno Marsman
      // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
      // +      input by: Ratheous
      // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
      // +   improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
      // -    depends on: get_html_translation_table
      // *     example 1: htmlentities('Kevin & van Zonneveld');
      // *     returns 1: 'Kevin &amp; van Zonneveld'
      // *     example 2: htmlentities("foo'bar","ENT_QUOTES");
      // *     returns 2: 'foo&#039;bar'
      var hash_map = get_html_translation_table('HTML_ENTITIES', quote_style),
        symbol = '';
      string = string == null ? '' : string + '';

      if (!hash_map) {
        return false;
      }

      if (quote_style && quote_style === 'ENT_QUOTES') {
        hash_map["'"] = '&#039;';
      }

      if (!!double_encode || double_encode == null) {
        for (symbol in hash_map) {
          if (hash_map.hasOwnProperty(symbol)) {
            string = string.split(symbol).join(hash_map[symbol]);
          }
        }
      } else {
        string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
          for (symbol in hash_map) {
            if (hash_map.hasOwnProperty(symbol)) {
              text = text.split(symbol).join(hash_map[symbol]);
            }
          }

          return text + entity;
        });
      }

      return string;
    }


    window.$P = {
        window: window,
        echo: echo,
        trim: trim,
        print_r: print_r,
        sprintf: sprintf,
        str_pad: str_pad,
        date: date,
        strtotime: strtotime,
        array_keys: array_keys,
        array_values: array_values,
        array_product: array_product,
        in_array: in_array,
        utf8_encode: utf8_encode,
        utf8_decode: utf8_decode,
        base64_encode: base64_encode,
        base64_decode: base64_decode,
        urlencode: urlencode,
        ucwords: ucwords,
        htmlentities: htmlentities
    };

})();


// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Øyvind Sean Kinsey http://kinsey.no/blog (2010)
//
// Information and discussions
// http://jspoker.pokersource.info/skin/test-printstacktrace.html
// http://eriwen.com/javascript/js-stack-trace/
// http://eriwen.com/javascript/stacktrace-update/
// http://pastie.org/253058
//
// guessFunctionNameFromLines comes from firebug
//
// Software License Agreement (BSD License)
//
// Copyright (c) 2007, Parakey Inc.
// All rights reserved.
//
// Redistribution and use of this software in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:
//
// * Redistributions of source code must retain the above
//   copyright notice, this list of conditions and the
//   following disclaimer.
//
// * Redistributions in binary form must reproduce the above
//   copyright notice, this list of conditions and the
//   following disclaimer in the documentation and/or other
//   materials provided with the distribution.
//
// * Neither the name of Parakey Inc. nor the names of its
//   contributors may be used to endorse or promote products
//   derived from this software without specific prior
//   written permission of Parakey Inc.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
// IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
// OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    var ex = (options && options.e) ? options.e : null;
    var guess = options ? !!options.guess : true;

    var p = new printStackTrace.implementation();
    var result = p.run(ex);
    return (guess) ? p.guessFunctions(result) : result;
}

printStackTrace.implementation = function() {};

printStackTrace.implementation.prototype = {
    run: function(ex) {
        ex = ex ||
            (function() {
                try {
                    var _err = __undef__ << 1;
                } catch (e) {
                    return e;
                }
            })();
        // Use either the stored mode, or resolve it
        var mode = this._mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    /**
     * @return {String} mode of operation for the environment in question.
     */
    mode: function(e) {
        if (e['arguments']) {
            return (this._mode = 'chrome');
        } else if (window.opera && e.stacktrace) {
            return (this._mode = 'opera10');
        } else if (e.stack) {
            return (this._mode = 'firefox');
        } else if (window.opera && !('stacktrace' in e)) { //Opera 9-
            return (this._mode = 'opera');
        }
        return (this._mode = 'other');
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        context['_old' + functionName] = context[functionName];
        context[functionName] = function() {
            callback.call(this, printStackTrace());
            return context['_old' + functionName].apply(this, arguments);
        };
        context[functionName]._instrumented = true;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context['_old' + functionName].constructor === Function) {
            context[functionName] = context['_old' + functionName];
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        return e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n');
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10: function(e) {
        var stack = e.stacktrace;
        var lines = stack.split('\n'), ANON = '{anonymous}',
            lineRE = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i, i, j, len;
        for (i = 2, j = 0, len = lines.length; i < len - 2; i++) {
            if (lineRE.test(lines[i])) {
                var location = RegExp.$6 + ':' + RegExp.$1 + ':' + RegExp.$2;
                var fnName = RegExp.$3;
                fnName = fnName.replace(/<anonymous function\:?\s?(\S+)?>/g, ANON);
                lines[j++] = fnName + '@' + location;
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    },

    // Opera 7.x-9.x only!
    opera: function(e) {
        var lines = e.message.split('\n'), ANON = '{anonymous}',
            lineRE = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i,
            i, j, len;

        for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
            //TODO: RegExp.exec() would probably be cleaner here
            if (lineRE.test(lines[i])) {
                lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
            }
        }

        lines.splice(j, lines.length - j);
        return lines;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i,
            stack = [], j = 0, fn, args;

        var maxStackSize = 10;
        while (curr && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments']);
            stack[j++] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                args[i] = 'undefined';
            } else if (arg === null) {
                args[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        args[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        args[i] = '[' + this.stringifyArguments(Array.prototype.slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(Array.prototype.slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    args[i] = '#object';
                } else if (arg.constructor === Function) {
                    args[i] = '#function';
                } else if (arg.constructor === String) {
                    args[i] = '"' + arg + '"';
                }
            }
        }
        return args.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL.
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (!req) {
            return;
        }
        req.open('GET', url, false);
        req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
        req.send('');
        return req.responseText;
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {}
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return url.indexOf(location.hostname) !== -1;
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <String> Source code
     */
    getSource: function(url) {
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
            var frame = stack[i], m = reStack.exec(frame);
            if (m) {
                var file = m[1], lineno = m[4]; //m[7] is character position in Chrome
                if (file && this.isSameDomain(file) && lineno) {
                    var functionName = this.guessFunctionName(file, lineno);
                    stack[i] = frame.replace('{anonymous}', functionName);
                }
            }
        }
        return stack;
    },

    guessFunctionName: function(url, lineNo) {
        try {
            return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
        } catch (e) {
            return 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
    },

    guessFunctionNameFromLines: function(lineNo, source) {
        var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
        var reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
        // Walk backwards from the first line in the function until we find the line which
        // matches the pattern above, which is the function definition
        var line = "", maxLines = 10;
        for (var i = 0; i < maxLines; ++i) {
            line = source[lineNo - i] + line;
            if (line !== undefined) {
                var m = reGuessFunction.exec(line);
                if (m && m[1]) {
                    return m[1];
                } else {
                    m = reFunctionArgNames.exec(line);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
        }
        return '(?)';
    }
};
