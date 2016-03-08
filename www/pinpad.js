var exec = require('cordova/exec');

//
function PinPad() {
    'use strict';

    this.receiveHookName = 'PINPAD_RECEIVE_DATA_HOOK';      // *** Event name to act as "hook" for data receiving
    this.pluginRef = 'PinPad';                              // *** Plugin reference for Cordova.exec calls
    this.socketConnectionLost = 'PINPAD_CONNECTION_LOST';
}

//
PinPad.prototype.connect = function (successCallback, errorCallback, host, port) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'connect', [host, port]);
};

//
PinPad.prototype.disconnect = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'disconnect', [connectionId]);
};

//
PinPad.prototype.isConnected = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'isConnected', [connectionId]);
};

//
PinPad.prototype.send = function (successCallback, errorCallback, connectionId, data) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'send', [connectionId, typeof data == 'string' ? data : JSON.stringify(data)]);
};

PinPad.prototype.status = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'status', [connectionId]);
};

PinPad.prototype.communicationTest = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'communicationTest', [connectionId]);
};

PinPad.prototype.purchase = function (successCallback, errorCallback, connectionId, ammount) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'purchase', [connectionId, ammount]);
};

PinPad.prototype.characteristics = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'characteristics', [connectionId]);
};

PinPad.prototype.open = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'open', [connectionId]);
};

PinPad.prototype.close = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'close', [connectionId]);
};
PinPad.prototype.openAndClose = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'openAndClose', [connectionId]);
};
PinPad.prototype.maintenance = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'maintenance', [connectionId]);
};

PinPad.prototype.lastPosTransaction = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'lastPosTransaction', [connectionId]);
};

PinPad.prototype.openSuperVisorMenu = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'openSuperVisorMenu', [connectionId]);
};

PinPad.prototype.localData = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'localData', [connectionId]);
};

PinPad.prototype.paymentCodes = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'paymentCodes', [connectionId]);
};

PinPad.prototype.readMagneticStripe = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'readMagneticStripe', [connectionId]);
};

PinPad.prototype.privateLabel = function (successCallback, errorCallback, connectionId) {
    'use strict';
    exec(successCallback, errorCallback, this.pluginRef, 'privateLabel', [connectionId]);
};


//
PinPad.prototype.receive = function (host, port, connectionId, chunk) {
    'use strict';

    var evReceive = document.createEvent('Events');

    evReceive.initEvent(this.receiveHookName, true, true);
    evReceive.metadata = {
        connection: {
            id: connectionId,
            host: host,
            port: port,
        },
        data: chunk
    };

    document.dispatchEvent(evReceive);
};

PinPad.prototype.connectionLost = function (data) {
    'use strict';

    var evReceive = document.createEvent('Events');

    evReceive.initEvent(this.socketConnectionLost, true, true);
    evReceive.metadata = {
        info: data
    };

    document.dispatchEvent(evReceive);
};

module.exports = new PinPad();
