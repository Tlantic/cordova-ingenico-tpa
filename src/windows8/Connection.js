/* jshint -W117 */
'use strict';

// Connection Class Definition
module.exports = function Connection(host, port) {
    var self = this,
        mustClose = false,
        rawSocket,
        hostname,
        service,
        reader;

    // init - constructor
    self.init = function Initialize(host, port) {

        // setting instance properties
        self.host = host;
        self.port = port;

        // creating network objects
        hostname = new Windows.Networking.HostName(host);
        service = port.toString();
        rawSocket = new Windows.Networking.Sockets.StreamSocket();
    };

    // Socket connect
    self.connect = function Connect(cbSuccess, cbFailure) {
        rawSocket.connectAsync(hostname, service).done(function onConnect() {

            try {
                // opening inputStream for reading
                reader = new Windows.Storage.Streams.DataReader(rawSocket.inputStream);
                //reader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;

                // start reading
                self.startReader();

                // returning success
                cbSuccess();
            } catch (e) {
                console.log('Unable to establish connection: ', e);
                cbFailure(e);
                self.close();
            }

        }, cbFailure);
    };

    // Socket closure
    self.close = function Close() {
        mustClose = true;
        rawSocket.close();
    };

    // Socket write
    self.write = function Write(data, cbSuccess, cbFailure) {

        // preparing for sending
        var writer = new Windows.Storage.Streams.DataWriter(rawSocket.outputStream),
            bufSize = writer.measureString(data); // Gets the UTF-8 string length.

        writer.writeInt32(bufSize);
        writer.writeString(data);

        console.log('Sending ', data);

        // flushing information
        writer.storeAsync().done(function () {

            // detaching outputStream and with success
            writer.detachStream();
            cbSuccess();

        }, cbFailure);

    };

    // Socket start receiving data
    self.startReader = function startReader() {
        var onErrorFn = function (err) {
            var socketErrorStatus = Windows.Networking.Sockets.SocketError.getStatus(err.number);

            if (socketErrorStatus === 1)
                self.onConnectionLost({closeOk: true});
            else
                self.onConnectionLost({closeOk: false, socketErrorStatus: socketErrorStatus});
        };

        reader.loadAsync(4).done(function onSuccess(stringHeader) {
            if (stringHeader === 0) {
                self.onConnectionLost({closeOk: false});
                return;
            }

            var strLength = reader.readInt32();

            reader.loadAsync(strLength).done(function onSuccess(numStrBytes) {

                // handling data receiving
                if (numStrBytes !== 0 && !mustClose) {
                    self.onReceive(self.host, self.port, reader.readBuffer(numStrBytes));
                }

                // checking reading ending
                if (mustClose) {
                    return;
                } else {
                    return startReader();
                }
            }, onErrorFn);

        }, onErrorFn);
    };

    // Socket data receiving
    self.onReceive = function onReceive() {
        console.log('no callback defined for Socket.OnReceive!');
    };

    self.onConnectionLost = function onConnectionLost() {
        console.log('no callback defined for Socket.OnReceive!');
    };


    // initializing object instance
    self.init(host, port);
};

// exporting module
require('cordova/windows8/commandProxy').add('Connection', module);
