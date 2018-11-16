Sidebar.Bluetooth = function (editor) {

    var signals = editor.signals;

    var container = new UI.Panel();

    var itemDict = {};

    var DevEnum = Windows.Devices.Enumeration;
    var deviceWatcher = null;
    var resultCollection = new WinJS.Binding.List([]);
    var resultsListView;
    var providePinTaskSrc;
    var confirmPinTaskSrc;

    var rfcomm = Windows.Devices.Bluetooth.Rfcomm;
    var sockets = Windows.Networking.Sockets;
    var streams = Windows.Storage.Streams;

    var chatSocket = new sockets.StreamSocket();

    var deviceBlock = document.createElement("div");
    deviceBlock.id = 'deviceConnBlock';
    deviceBlock.style.width = '100%';
    deviceBlock.style.margin = '5px';
    deviceBlock.style.backgroundColor = 'green';
    deviceBlock.style.textAlign = 'center';
    deviceBlock.style.color = 'white';
    deviceBlock.style.display = 'none';
    var deviceName = document.createTextNode("none");
    deviceBlock.appendChild(deviceName);

    container.dom.appendChild(deviceBlock);

    var scroll = document.createElement("div");
    scroll.style.marginTop = '10px';
    scroll.style.width = '290px';
    scroll.style.height = '200px';
    scroll.style.overflow = 'auto';
    scroll.style.display = 'none';
    scroll.style.backgroundColor = '#222';

    var sc = document.createElement('div');
    sc.style.display = 'none';
    container.dom.appendChild(sc);

    var scroll2 = new WinJS.UI.ListView(sc, '{itemTemplate: select(&apos;#resultsViewTemplate &apos;),layout: { type: WinJS.UI.ListLayout },tapBehavior: &apos; toggleSelect &apos;,selectionMode: &apos; single &apos;}');
    scroll2.element.id = 'resultsListView';

    scroll2.element.style.display = 'none';

    var scroll3 = document.createElement("div");
    scroll3.style.marginTop = '10px';
    scroll3.style.width = '290px';
    scroll3.style.height = '200px';
    scroll3.style.overflow = 'auto';
    scroll3.style.display = 'none';
    scroll3.style.backgroundColor = '#222';
    container.dom.appendChild(scroll3);

    var selectorComboBox = document.createElement("select");
    selectorComboBox.setAttribute("id", "selectorComboBox");
    selectorComboBox.setAttribute("class", "win-dropdown");
    container.add(selectorComboBox);

    var startWatcherButton = new UI.Button("Show Devices");
    startWatcherButton.id = "startWatcherButton";
    startWatcherButton.dom.style.width = '100%';
    startWatcherButton.dom.style.margin = '5px';
    startWatcherButton.dom.style.display = 'none';
    container.add(startWatcherButton);

    container.dom.appendChild(scroll);

    container.add(new UI.Break(), new UI.Break());

    var device = null;
    var charar = null;

    WinJS.UI.processAll();

    document.addEventListener('DOMContentLoaded', function () {
        adddev();
    }, false);

    function adddev() {
        // Hook up button event handlers
        startWatcherButton.dom.addEventListener("click", startWatcher, false);

        // Hook up result list selection changed event handler
        resultsListView = scroll2;
        //resultsListView.addEventListener("selectionchanged", onSelectionChanged(this));
        // Hook up result list data binding
        resultsListView.itemDataSource = resultCollection.dataSource;

        // Manually bind selector options
        DisplayHelpers.pairingSelectors.forEach(function each(item) {
            var option = document.createElement("option");
            option.textContent = item.displayName;
            selectorComboBox.appendChild(option);
        });
        selectorComboBox.selectedIndex = 0;

        // Process any data bindings
        WinJS.UI.processAll();
    }

    function startWatcher() {
        signals.startWatcher.dispatch();
    }

    signals.startWatcher.add(function () {
        console.log("Device Watcher Started");
        console.log(itemDict);
        if (scroll.style.display === 'block') {
            scroll.style.display = 'none';
            startWatcherButton.dom.style.display = "none";
            startWatcherButton.dom.textContent = "Show Devices";
        } else {
            scroll.style.display = 'block';
            startWatcherButton.dom.style.display = "block";
            startWatcherButton.dom.textContent = "Hide Devices";
        }

        if (deviceWatcher != null) {
            return;
        }

        scroll.style.display = 'block';
        
        startWatcherButton.disabled = true;
        resultCollection.splice(0, resultCollection.length);

        // Get the device selector chosen by the UI then add additional constraints for devices that 
        // can be paired or are already paired.
        var selectedItem = DisplayHelpers.pairingSelectors.getAt(selectorComboBox.selectedIndex);
        var selector = "(" + "System.Devices.Aep.ProtocolId:=\"{e0cbf06c-cd8b-4647-bb8a-263b43f0f974}\"" + "OR " + "System.Devices.Aep.ProtocolId:=\"{bb7bb05e-5972-42b5-94fc-76eaa7084d49}\"" + ")" + " AND (System.Devices.Aep.CanPair:=System.StructuredQueryType.Boolean#True OR System.Devices.Aep.IsPaired:=System.StructuredQueryType.Boolean#True)";
        //var selectorLE = "(" + "System.Devices.Aep.ProtocolId:=\"{bb7bb05e-5972-42b5-94fc-76eaa7084d49}\"" + ")" + " AND (System.Devices.Aep.CanPair:=System.StructuredQueryType.Boolean#True OR System.Devices.Aep.IsPaired:=System.StructuredQueryType.Boolean#True)";

        if (selectedItem.kind === DevEnum.DeviceInformationKind.unknown) {
            // Kind will be determined by the selector
            deviceWatcher = DevEnum.DeviceInformation.createWatcher(
                selector,
                null // don't request additional properties for this pair
            );
        } else {
            // Kind will be determined by the selector
            deviceWatcher = DevEnum.DeviceInformation.createWatcher(
                selector,
                null, // don't request additional properties for this pair
                selectedItem.kind);
        }

        // Add event handlers
        deviceWatcher.addEventListener("added", onAdded);
        deviceWatcher.addEventListener("updated", onUpdated);
        deviceWatcher.addEventListener("removed", onRemoved);
        deviceWatcher.addEventListener("enumerationcompleted", onEnumerationCompleted);
        deviceWatcher.addEventListener("stopped", onStopped);

        WinJS.log && WinJS.log("Starting watcher...", "sample", "status");
        deviceWatcher.start();
    });

    function stopWatcher() {
        console.log("Stop Watcher");

        if (null != deviceWatcher) {

            deviceWatcher.removeEventListener("added", onAdded);
            deviceWatcher.removeEventListener("updated", onUpdated);
            deviceWatcher.removeEventListener("removed", onRemoved);
            deviceWatcher.removeEventListener("enumerationcompleted", onEnumerationCompleted);

            if (DevEnum.DeviceWatcherStatus.started === deviceWatcher.status ||
                DevEnum.DeviceWatcherStatus.enumerationCompleted === deviceWatcher.status) {
                deviceWatcher.stop();
            }
        }

        startWatcherButton.disabled = false;
    }
    function pairDevice(dev) {
        console.log(dev);
        var protectionLevel = dev.deviceInformation.pairing.protectionLevel;
        var customPairing = dev.deviceInformation.pairing.custom;
        var ceremonySelection = DevEnum.DevicePairingKinds.none;
        ceremonySelection |= DevEnum.DevicePairingKinds.confirmOnly;
        customPairing.addEventListener("pairingrequested", pairingRequestHandler);

        customPairing.pairAsync(ceremonySelection, protectionLevel).done(
            function (pairingResult) {
                var statusType = pairingResult.status === DevEnum.DevicePairingResultStatus.paired ? "status" : "error";
                var message = pairingResult.status === DevEnum.DevicePairingResultStatus.paired ? "Paired" : "NotPaired";
                WinJS.log && WinJS.log("Pairing result = " + message, "sample", statusType);

                customPairing.removeEventListener("pairingrequested", pairingRequestHandler);
                console.log("Paired");
                return true;
            });
        return false;
    }

    function unpairDevice() {
        console.log("unpair");
        // Gray out the pair button and results view while pairing is in progress.
        WinJS.log && WinJS.log("Unpairing started. Please wait...", "sample", "status");

        var selectedItems = resultsListView.selection.getIndices();

        if (selectedItems.length > 0) {
            var deviceDispInfo = resultCollection.getAt(selectedItems[0]);

            deviceDispInfo.deviceInfo.pairing.unpairAsync().done(
                function (unpairingResult) {
                    var message = unpairingResult.status === DevEnum.DeviceUnpairingResultStatus.unpaired ? "Unpaired" : "Failed";
                    var statusType = unpairingResult.status === DevEnum.DeviceUnpairingResultStatus.unpaired ? "status" : "error";
                    WinJS.log && WinJS.log("Unpairing result = " + message, "sample", statusType);

                });
        }
    }

    function onAdded(deviceInfo) {
        console.log("Added");
        // For simplicity, just creating a new "display object" on the fly since databinding directly with deviceInfo from
        // the callback doesn't work. 
        resultCollection.push(new DisplayHelpers.DeviceInformationDisplay(deviceInfo));
        if (deviceInfo.name.substring(0, 5) === "DISTO" || deviceInfo.name.substring(0, 5) === 'Bosch') {
            console.log(deviceInfo);
            itemDict[deviceInfo.id] = deviceInfo;
            createDeviceListItem(deviceInfo.id, true);
        }

        if (deviceWatcher.status === DevEnum.DeviceWatcherStatus.enumerationCompleted) {
            WinJS.log && WinJS.log(resultCollection.length + " devices found. Watching for updates...", "sample", "status");
        }
    }

    function onUpdated(deviceInfoUpdate) {
        console.log("Updated");
        // Find the corresponding updated DeviceInformation in the collection and pass the update object
        // to the Update method of the existing DeviceInformation. This automatically updates the object
        // for us.
        resultCollection.forEach(function (value, index, array) {
            if (value.id === deviceInfoUpdate.id) {
                value.update(deviceInfoUpdate);
                console.log("UPDATE ");
                console.log(value);
                if (value.id in itemDict) {
                    itemDict[value] = value.deviceInformation;
                }
                createDeviceListItem(deviceInfoUpdate.id, true);
            }
        });
    }

    function onRemoved(deviceInfoUpdate) {
        console.log("Removed");
        for (var i = 0; resultCollection.length; i++) {
            if (resultCollection.getAt(i).id === deviceInfoUpdate.id) {
                resultCollection.splice(i, 1);
                delete itemDict[deviceInfoUpdate.id];
                break;
            }
        }
        WinJS.log && WinJS.log(resultCollection.length + " devices found. Watching for updates...", "sample", "status");
    }

    function onEnumerationCompleted(obj) {
        console.log("Enum Complete");
        WinJS.log && WinJS.log(resultCollection.length + " devices found. Enumeration completed. Watching for updates...", "sample", "status");
    }

    function onStopped(obj) {
        console.log("Stopped");
        WinJS.log && WinJS.log(resultCollection.length + " devices found. Watcher stopped", "sample", "status");
    }

    function onSelectionChanged(item) {
        console.log("Selection Changed");
        console.log(item);
        //updatePairingButtons();
    }

    function bluetoothLeConnect(deviceInfo) {
        Windows.Devices.Bluetooth.BluetoothLEDevice.fromIdAsync(deviceInfo.id).done(function (result) {
            console.log("Completed" + "- " + result);
            device = result;
            result.getGattServicesAsync().done(function (dev) {
                console.log("Connected BTLe");
                for (var i = 0, len = dev.services.length; i < len; i++) {
                    var sv = dev.services[i];
                    if (sv.uuid === "3ab10100-f831-4395-b29d-570977d5bf94") {
                        sv.getCharacteristicsAsync().done(function (chatt) {
                            console.log(chatt.characteristics);

                            subscribe(chatt.characteristics[0]);
                            var descriptorValue = Windows.Devices.Bluetooth.GenericAttributeProfile.GattClientCharacteristicConfigurationDescriptorValue.indicate;
                            chatt.characteristics[0].writeClientCharacteristicConfigurationDescriptorAsync(descriptorValue).done(function (ret) {
                                if (ret === Windows.Devices.Bluetooth.GenericAttributeProfile.GattCommunicationStatus.success) {
                                    console.log("Written");
                                    chatt.characteristics[0].onvaluechanged = function (result) {
                                        var value = Windows.Security.Cryptography.CryptographicBuffer.encodeToHexString(result.characteristicValue);
                                        printerFunc(value);
                                    };
                                    charar = chatt.characteristics[0];
                                    console.log(chatt.characteristics);
                                    deviceConnected(deviceInfo.name);
                                    removeDeviceListItem(deviceInfo.id);
                                }
                            });
                        });
                    }
                }
            });

        });
    }

    function bluetoothClassicConnect(deviceInfo) {

        var customPairing = deviceInfo.pairing.custom;

        customPairing.addEventListener("pairingrequested", pairingRequestHandler);

        var ceremoniesSelected = DevEnum.DevicePairingKinds.none;
        ceremoniesSelected |= DevEnum.DevicePairingKinds.confirmOnly;

        var protectionLevel = 0;
        Windows.Devices.Bluetooth.BluetoothDevice.fromIdAsync(deviceInfo.id).done(function (result) {
            console.log("CONNECTED RFCOMM");
            console.log(result);
            if (!result.bluetoothDeviceId.isClassicDevice) {
                console.log("Failed");
                return;
            }
            result.getRfcommServicesAsync().done(function (service) {
                console.log(service);
                var clientSocket = new sockets.StreamSocket();
                console.log("Got RFCOMMS");
                var serviceId = service.services[0];//.serviceId.uuid;
                console.log(serviceId);
                if (serviceId === undefined) {
                    alert("Please pair device in Windows and try again");
                    return;
                }
                if (serviceId.device.connectionStatus == 1) {
                    console.log("Already Connected ? ");
                    return;
                }
                serviceId.getSdpRawAttributesAsync(Windows.Devices.Bluetooth.BluetoothCacheMode.uncached).then( 
                    function (attributes) {
                        console.log("Got That SDP");
                        try {
                            console.log(attributes);
                            var buffer = attributes.lookup(5);
                            console.log(buffer);
                            var attributeReader = streams.DataReader.fromBuffer(buffer);
                            console.log(attributeReader);
                            var attributeType = attributeReader.readByte();
                            console.log(attributeType);
                            var serviceNameLength = attributeReader.readByte();
                            console.log(serviceNameLength);

                            chatSocket = new sockets.StreamSocket();
                            chatSocket.connectAsync(
                                serviceId.connectionHostName,
                                serviceId.connectionServiceName,
                                sockets.SocketProtectionLevel.plainSocket).done(function () {
                                    chatWriter = new streams.DataWriter(chatSocket.outputStream);
                                    chatReader = new streams.DataReader(chatSocket.inputStream);

                                    deviceConnected(result.name);
                                    receiveStringLoop(chatReader, chatWriter);
                                });
                        } catch (err) {
                            console.log(err);
                            console.log("Error Happened");
                        }
                    }
                ).done(null, function (err) {
                    console.log("There was an error");
                    });
            });
        });
    }

    function receiveStringLoop(reader, writer) {
        reader.loadAsync(16).done(function (size) {
            if (size < 16) {
                //disconnect();
                deviceDisconnected();
                console.log("DISCONNECT1!");
                WinJS.log && WinJS.log("Client disconnected.", "sample", "status");
                return;
            }
            var stringLength = reader.readString(size);
            writer.writeString('cfm\r');
            parseClassic(stringLength);
            writer.storeAsync().done(function () {
                reader.loadAsync(5).done(function (jun) {
                    var junk = reader.readString(jun);
                    console.log("Written");
                    return receiveStringLoop(reader, writer);
                });
            });


        }, function (error) {
            console.log("FAILED TO READ MESSAGE");
            WinJS.log && WinJS.log("Failed to read the message size, with error: " + error, "sample", "error");
        });
    }

    function pairingRequestHandler(args) {
        if (args.pairingKind === DevEnum.DevicePairingKinds.confirmOnly) {
            args.accept();
        }
        else if (args.pairingKind === DevEnum.DevicePairingKinds.displayPin) {
            args.accept();

            showPairingPanel("Please enter this PIN on the device you are pairing with: " + args.pin, args.pairingKind);
        }
        else if (args.pairingKind === DevEnum.DevicePairingKinds.providePin) {
            var collectPinDeferral = args.getDeferral();

            getPinFromUserAsync().then(function (pin) {
                if (pin) {
                    args.accept(pin);
                }
                collectPinDeferral.complete();
            });
        }
        else if (args.pairingKind === DevEnum.DevicePairingKinds.confirmPinMatch) {
            var displayMessageDeferral = args.getDeferral();

            getUserConfirmationAsync(args.pin).then(function (accept) {
                if (accept) {
                    args.accept();
                }
                displayMessageDeferral.complete();
            });
        }
    }

    function connectToBT(deviceID) {
        var devinf = itemDict[deviceID];
        console.log(devinf);
        if (deviceID.substring(0, 11) === "BluetoothLE") {
            console.log("Bluetooth LE");
            bluetoothLeConnect(devinf);
        } else if (deviceID.substring(0, 9) === "Bluetooth") {
            console.log("Bluetooth Classic");
            bluetoothClassicConnect(devinf);
        }
        console.log(devinf);
    }

    function createDeviceListItem(exceptItem, except = false) {
        while (scroll.firstChild) {
            scroll.removeChild(scroll.firstChild);
        }
        for (var key in itemDict) {
            if (key != exceptItem || except) {
                var devInfo = itemDict[key];
                if (devInfo === undefined) {
                    return;
                }
                var devver = document.createElement("div");
                devver.className = "BTItemClass";
                devver.id = "dict" + Object.keys(itemDict).indexOf(key);
                console.log(Object.keys(itemDict).indexOf(key));
                devver.setAttribute("key", key);
                devver.onclick = function () {
                    connectToBT(this.getAttribute("key"));
                };
                devver.style.border = 'none';

                var nameDevver = document.createElement('span');
                nameDevver.style.fontWeight = 'bold';
                nameDevver.appendChild(document.createTextNode("Name: "));
                nameDevver.appendChild(document.createTextNode(devInfo.name));
                devver.appendChild(nameDevver);
                devver.appendChild(document.createElement('br'));

                var idDevver = document.createElement('span');
                idDevver.style.textOverflow = 'hidden';
                idDevver.appendChild(document.createTextNode(devInfo.id));
                devver.appendChild(idDevver);

                scroll.appendChild(devver);
            }
        }
    }

    function removeDeviceListItem(devInfo) {
        createDeviceListItem(devInfo);
    }

    function deviceConnected(name) {
        scroll.style.display = 'none';
        deviceBlock.style.display = 'block';
        deviceName.nodeValue = name;
    }

    function deviceDisconnected() {
        deviceBlock.style.display = 'none';
    }
 
    function characteristicValueChanged(sender, args) {
        console.log("CVAL CHANGE" + args);
    }

    function subscribe(characteristic) {
        console.log("subscribing to " + characteristic);
        console.log(characteristic);

    }

    function parseClassic(val) {
        console.log(val);

        if (val.substring(0, 4) === "31..") {
            var unit = val.substring(4, 6);
            var value = val.substring(7, 15);
            var ft = 0;
            var inches = 0;
            var frac = 0;
            var nm = 0;
            switch (val.substring(4, 6)) {
                case '00':
                    //Format: 0.000 m 
                    var ftmet = parseInt(value.substring(0, 5) + '.' + value.substring(5, 8)) * 3.28084;
                    nm = ftmet;
                    ft = Math.floor(ftmet);
                    inches = Math.ceil((ft - ftmet) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '01':
                    //Format: 0.00 ft
                    var inset = parseInt(value.substring(0, 6) + '.' + value.substring(6, 8));
                    nm = inset;
                    ft = Math.floor(inset);
                    inches = Math.ceil((ft - inset) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '02':
                    //Format: 0.0 in
                    inset = parseInt(value.substring(0, 7) + '.' + value.substring(7, 8)) / 12;
                    nm = inset;
                    ft = Math.floor(inset);
                    inches = Math.ceil((ft - inset) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '03':
                    //Format: 0 1/32 in
                    inset = parseInt(value.substring(0, 6)) / 12;
                    nm = inset;
                    ft = Math.floor(inset);
                    inches = Math.ceil((ft - inset) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '04':
                    //Format: 0 mm 0.00328084
                    ftmet = parseInt(value.substring(0, 8)) * 0.00328084;
                    nm = ftmet;
                    ft = Math.floor(ftmet);
                    inches = Math.ceil((ft - ftmet) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '05':
                    //Format: 0.00 m
                    ftmet = parseInt(value.substring(0, 6) + '.' + value.substring(6, 8)) * 3.28084;
                    nm = ftmet;
                    ft = Math.floor(ftmet);
                    inches = Math.ceil((ft - ftmet) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '06':
                    //Format: 0.0000 m
                    ftmet = parseInt(value.substring(0, 4) + '.' + value.substring(4, 8)) * 3.28084;
                    nm = ftmet;
                    ft = Math.floor(ftmet);
                    inches = Math.ceil((ft - ftmet) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '07':
                    //Format: 0.000 yd
                    var ftinch = parseInt(value.substring(0, 5) + '.' + value.substring(5, 8)) * 3;
                    nm = ftinch;
                    ft = Math.floor(ftinch);
                    inches = Math.ceil((ft - ftinch) * 12);
                    if (inches === 12) {
                        ft += 1;
                        inches = 0;
                    }
                    break;
                case '08':
                    //Format: 0' 00" 1/16
                    ft = parseInt(value.substring(0, 4));
                    inches = parseInt(value.substring(4, 6));
                    frac = parseInt(value.substring(6, 8));
                    if (frac > 0) {
                        inches += 1;
                        if (inches >= 12) {
                            inches = 0;
                            ft += 1;
                        }
                    }
                    nm = ft + inches / 12;
                    break;
                case '09':
                    //Format: 0' 00" 1/32
                    ft = parseInt(value.substring(0, 4));
                    inches = parseInt(value.substring(4, 6));
                    frac = parseInt(value.substring(6, 8));
                    if (frac > 0) {
                        inches += 1;
                        if (inches >= 12) {
                            inches = 0;
                            ft += 1;
                        }
                    }
                    nm = ft + inches / 12;
                    break;
            }
            console.log(ft + " \' " + inches + "\"");
            signals.setWallValue.dispatch([ft, inches], true);
        } else if (val.substring(0, 6) === "5000..") {
            var direc = parseInt(val.substring(7));
            if (direc === 3 || direc === 6) {
                signals.flip.dispatch("Disto");
            } else if (direc === 2) {
                //complete
                signals.completeRoom.dispatch("Disto");
            } else if (direc === 1) {
                //Back
                signals.backspace.dispatch("Disto");
            }
        }
    }

    function printerFunc(val) {
        console.log(val);
        var hx = val.match(/.{1,2}/g);
        hx.reverse();

        var dt = new ArrayBuffer(4);
        var view = new DataView(dt);

        hx.forEach(function (b, i) {
            var p = parseInt(b, 16);
            view.setUint8(i, p);
        });

        var nm = view.getFloat32(0);

        var inft = nm / 0.3048;
        var ft = Math.floor(inft);
        var temp = (inft - Math.trunc(inft)) / 0.083333333333;
        var incher = Math.ceil(temp);
        if (incher >= 12) {
            incher -= 12;
            ft += 1;
        }

        //signals.setWallValue.dispatch(nm);
        console.log(ft + " \' " + incher + "\"");
        signals.setWallValue.dispatch([ft, incher], true);

        //footinput.value = "Distance: " + ft + "'" + incher + "\"";
    }


    return container;
};