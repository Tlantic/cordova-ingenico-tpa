/* jshint -W117 */
'use strict';

var Connection = require('com.tlantic.plugins.pinpad.Connection');

// connection pool
exports.pool = [];

// builds connectionId
exports.buildKey = function (host, port) {
    return host.toLowerCase() + ':' + port;
};

//
exports.buildResponseData = function (data) {
    var _data = new Uint8Array(data);
    var hexEncodeArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

    var rawReceivedData = '';
    var responseFields = [''];

    for (var i = 0; i < _data.length; i++) {
        var elm = _data[i];
        var hexToken = hexEncodeArray[elm >>> 4].concat(hexEncodeArray[elm & 0x0F]);
        rawReceivedData += hexToken.concat(' ');
        if (hexToken === '1E') {
            responseFields.push('');
        }
        // Do not substitute in extraData responseFields
        else if(hexToken === '0A' && responseFields.length < 3){
            responseFields[responseFields.length - 1] += '\n';
        }
        else {
            responseFields[responseFields.length - 1] += elm < 32 ? '.' : String.fromCharCode(elm);
        }
    }

    return {
        returnCode: parseInt(responseFields[0]),
        clientReceipt: responseFields[1] || null,
        merchantReceipt: responseFields[2] || null,
        extraData: responseFields[3] || null,
        rawReceivedData: rawReceivedData
    };
};

exports.buildRequest = function (ConnectionId, OperationType, Service, Amount, ExtraData, RFU, Name) {
    var data = {
        "OperationType": OperationType,
        "Amount": Amount,
        "Extradata": ExtraData,
        "RFU": RFU,
        "Name": Name,
        "Service": Service
    };
    return [ConnectionId, JSON.stringify(data)];
};

// establish TCP connection with remote endpoint
exports.connect = function (win, fail, args) {

    var host, port, key, socket;

    // validating parameters
    if (args.length !== 2) {
        fail('Missing arguments for "connect" action.');
        return;

    } else {

        // building connection key
        host = args[0];
        port = args[1];
        key = exports.buildKey(host, port);

        // trying to recover an existing connection
        if (exports.pool[key]) {
            console.log('Recovered connection with ', key);
            win(key);
            return;

        } else {

            // creating new connection;
            socket = new Connection(host, port);
            socket.onReceive = exports.sendMessage;
            socket.onConnectionLost = exports.connectionLost;

            // opening stream
            socket.connect(function () {

                // adding to pool
                console.log('Connection with ', key, ' opened successfully!');
                exports.pool[key] = socket;

                // returning key as success sign
                win(key);
            }, fail);
        }
    }

};

// closes TCP connection and releases network resources
exports.disposeConnection = function (socket) {

    var result = false;

    try {
        socket.close();
        result = true;

    } catch (e) {
        console.log('Unable to close connection!');
        result = false;

    } finally {
        return result;
    }
};

// closes a specific connection
exports.disconnect = function (win, fail, args) {

    var key, socket;

    // validating parameters
    if (args.length !== 1) {
        fail('Missing arguments for "disconnect" action.');
        return;
    } else {

        // retrieving existing connection
        key = args[0];
        socket = exports.pool[key];
        if (!socket) {
            fail('Connection ' + key + ' not found!');
            return;
        } else {

            // removing from pool and closing socket
            exports.pool[key] = undefined;

            if (exports.disposeConnection(socket)) {
                win();
            } else {
                fail('Unable to close connection with ' + key);
            }

            return;
        }
    }

};

// closes all active connections
exports.disconnectAll = function (win, fail) {

    var socket, partial = false;

    console.log('Preparing to disconnect all connections:');

    // checking all connections from pool
    for (var key in exports.pool) {

        // retrieving existing socket
        console.log('- Closing ', key, ' ...');
        socket = exports.pool[key];

        // disposing socket
        if (!exports.disposeConnection(socket)) {
            partial = true;
            console.log('- Unable to close ', key);
        }

        // removing from pool
        exports.pool[key] = undefined;
    }


    // returning based on all results
    if (partial) {
        fail('Some connections could not be closed!');
    } else {
        win();
    }
};

// writes data in outputStream
exports.send = function (win, fail, args) {

    var key, data, socket;

    // validating parameters
    if (args.length !== 2) {
        fail('Missing arguments for "disconnect" action.');
        return;
    } else {

        // retrieving existing connection
        key = args[0];
        data = args[1];

        socket = exports.pool[key];
        if (!socket) {
            fail('Connection ' + key + ' not found!');
            return;
        } else {

            // flushing information
            socket.write(data, win, fail);

        }
    }

};

exports.status = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "status" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "N", false, "000000000", "00000000000000000000000 ", "", "Status Command");
        exports.send(win, fail, request);
    }
};

exports.communicationTest = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "communicationTest" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "C", false, "000000000", "00000000000000000000000 ", "", "Communication Test");
        exports.send(win, fail, request);
    }
};

exports.purchase = function (win, fail, args) {
    if (args.length !== 2) {
        fail('Missing arguments for "purchase" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "S", false, args[1], "00000000000000000000000 ", "", "Purchase");
        exports.send(win, fail, request);
    }
};

exports.characteristics = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "?", false, "000000000", "00000000000000000000000 ", "", "Pinpad Characteristics");
        exports.send(win, fail, request);
    }
};

exports.open = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "O", false, "000000000", "00000000000000000000000 ", "", "TPA Activate");
        exports.send(win, fail, request);
    }
};

exports.close = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "V", false, "000000000", "00000000000000000000000 ", "", "TPA Deactivate");
        exports.send(win, fail, request);
    }
};

exports.openAndClose = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "W", false, "000000000", "00000000000000000000000 ", "", "Totais TPA");
        exports.send(win, fail, request);
    }
};

exports.maintenance = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "F", false, "000000000", "00000000000000000000000 ", "", "maintenance TPA");
        exports.send(win, fail, request);
    }
};

exports.lastPosTransaction = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "I", false, "000000000", "00000000000000000000000 ", "", "Inquiry Last POS Transaction");
        exports.send(win, fail, request);
    }
};

exports.openSuperVisorMenu = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "H", false, "000000000", "00000000000000000000000 ", "", "Open Supervisor Menu");
        exports.send(win, fail, request);
    }
};


exports.localData = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "localData" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "L", false, "000000000", "00000000000000000000000 ", "", "Local Data");
        exports.send(win, fail, request);
    }
};

exports.paymentCodes = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "paymentCodes" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "L", false, "00000100", "70000000000000000000000 ", "", "Payment Codes");
        exports.send(win, fail, request);
    }
};

exports.readMagneticStripe = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "M", false, "000000000", "00000000000000000000000 ", "", "Read Magnetic Stripe");
        exports.send(win, fail, request);
    }
};


exports.repeatLastReceipt = function (win, fail, args) {
    if (args.length !== 1) {
        fail('Missing arguments for "characteristics" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "Z", false, "000000000", "00000000000000000000000 ", "", "Repeat Last Receipt");
        exports.send(win, fail, request);
    }
};

exports.privateLabel = function (win, fail, args) {
    if (args.length !== 2) {
        fail('Missing arguments for "privateLabel" action.');
        return;

    } else {
        var request = exports.buildRequest(args[0], "P", false, "000000000", args[1] + "00000000000000000000   ", "", "Private Label");
        exports.send(win, fail, request);
    }
};

// callback to receive data written on socket inputStream
exports.sendMessage = function (host, port, data) {

    var key = exports.buildKey(host, port);
    var _data = exports.buildResponseData(data);

    window.tlantic.plugins.pinpad.receive(host, port, key, _data);
};


exports.connectionLost = function (data) {

    window.tlantic.plugins.pinpad.connectionLost(data);
};

require('cordova/windows8/commandProxy').add('PinPad', exports);
