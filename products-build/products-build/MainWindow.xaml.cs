using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Windows.Devices.Bluetooth;
using Windows.Devices.Bluetooth.GenericAttributeProfile;
using Windows.Devices.Enumeration;
using SDKTemplate;
using System.Collections.ObjectModel;
using Windows.Storage.Streams;
using Windows.Security.Cryptography;
using System.Windows.Threading;
using System.ComponentModel;
using System.Windows.Forms;
using System.Diagnostics;


namespace TekDistoComm
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            
            InitializeComponent();

            if (System.Diagnostics.Process.GetProcessesByName(System.IO.Path.GetFileNameWithoutExtension(System.Reflection.Assembly.GetEntryAssembly().Location)).Count() > 1)
            {
                var procs = System.Diagnostics.Process.GetProcessesByName(System.IO.Path.GetFileNameWithoutExtension(System.Reflection.Assembly.GetEntryAssembly().Location)).AsQueryable();
                if (procs.Count() > 1)
                {
                   procs.Where(p => p.Id != Process.GetCurrentProcess().Id).First().Kill();
                }
            }

            this.SizeToContent = SizeToContent.WidthAndHeight;
        }
        private Queue<string> deviceQueue = new Queue<string>();

        public string prefName = "DISTO";
        public string prefServ = "Custom Service: 3ab10100-f831-4395-b29d-570977d5bf94";
        public string prefChar = "(3ab10101-f831-4395-b29d-570977d5bf94)";
        private bool connecting = false;
        private bool subscribedForNotifications = false;
        private bool changing = false;
        private bool connected = false;
        private bool clearing = false;
        private int timeout = 2000;
        private BluetoothLEDevice bluetoothLeDevice;
        
        private GattCharacteristic registeredCharacteristic;
        private DeviceWatcher deviceWatcher;
        private ObservableCollection<BluetoothLEDeviceDisplay> KnownDevices = new ObservableCollection<BluetoothLEDeviceDisplay>();
        private List<DeviceInformation> UnknownDevices = new List<DeviceInformation>();
        private Dictionary<string, DeviceInformation> dict = new Dictionary<string, DeviceInformation>();

        private async Task<bool> ConnectDevice(DeviceInformation deviceInfo = null)
        {
            if (connected)
            {
                RemoveValueChangedHandler();
                if (await ClearBluetoothLEDeviceAsync())
                {
                    connected = false;
                }
            }
            connecting = true;
            bool noexp = false;

            if (deviceInfo == null)
            {
                deviceInfo = dict[deviceQueue.Dequeue()];
                noexp = true;
            }
            if (deviceInfo.IsEnabled)
            {
                Console.Write("Enabled");
            }
            var recon = (bluetoothLeDevice != null && bluetoothLeDevice.Equals(deviceInfo));

            Update_DeviceName($"Connecting to {deviceInfo.Name}", 1);
            if (bluetoothLeDevice == null)
            {
                bluetoothLeDevice = await BluetoothLEDevice.FromIdAsync(deviceInfo.Id);
            }
            else
            {
                var devinfolock = deviceInfo;
                if (await ClearBluetoothLEDeviceAsync())
                {
                    bluetoothLeDevice = await BluetoothLEDevice.FromIdAsync(deviceInfo.Id);
                    Update_DeviceList();
                }
            }


            if (bluetoothLeDevice != null)
            {
                bluetoothLeDevice.ConnectionStatusChanged += ConnectionChanged;
            }
            else
            {
                if (noexp)
                {
                    deviceQueue.Enqueue(deviceInfo.Name);
                }
                connecting = false;
                Update_DeviceName("<Disconnected>", 2);
                Console.WriteLine("Connection Failed");
                return false;
            }


            if (deviceInfo.Pairing.IsPaired)
            {
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(async () =>
                {
                    await deviceInfo.Pairing.UnpairAsync();
                    Process.Start(System.Windows.Application.ResourceAssembly.Location);
                    System.Windows.Application.Current.Shutdown();
                });
                return false;
                //gattgot = await GetGatt(deviceInfo);
            }
            else if (deviceInfo.Pairing.CanPair)
            {
                if (subscribedForNotifications)
                {
                    RemoveValueChangedHandler();
                }

                GattDeviceServicesResult result = await bluetoothLeDevice.GetGattServicesAsync(BluetoothCacheMode.Uncached);
                if (result.Status == GattCommunicationStatus.Success)
                {

                    Update_DeviceName($"Subscribing to {deviceInfo.Name}", 1);
                    connected = true;
                    connecting = false;
                    return await GetGatt(result);
                } else
                {
                    await ClearBluetoothLEDeviceAsync();
                    Update_DeviceName(deviceInfo.Name + " is unreachable", 2);
                    if (noexp)
                    {
                        deviceQueue.Enqueue(deviceInfo.Name);
                    }
                    connecting = false;
                    ConnectDevice();
                    return false;
                }
            }
            else
            {
                bluetoothLeDevice.ConnectionStatusChanged -= ConnectionChanged;
                bluetoothLeDevice?.Dispose();
                if (noexp && deviceInfo.Name != string.Empty)
                {
                    deviceQueue.Enqueue(deviceInfo.Name);
                }
                Update_DeviceName(deviceInfo.Name + " is unreachable", 2);
                connecting = false;
            }
            return false;
        }

        private async Task<bool> GetGatt(GattDeviceServicesResult servres)
        {
            var services = servres.Services;
            foreach (var blatt in services)
            {
                var service = new BluetoothLEAttributeDisplay(blatt);
                if (service.Name == prefServ)
                {
                    if (await service.service.RequestAccessAsync() == DeviceAccessStatus.Allowed)
                    {
                        var res = await service.service.GetCharacteristicsAsync(BluetoothCacheMode.Uncached);
                        if (res.Status == GattCommunicationStatus.Success)
                        {
                            foreach (var chat in res.Characteristics)
                            {
                                //var gatt = new BluetoothLEAttributeDisplay(chat);
                                if (chat.Uuid.ToString("P") == prefChar)
                                {
                                    try
                                    {
                                        var returned = await
                                                chat.WriteClientCharacteristicConfigurationDescriptorAsync(
                                                    GattClientCharacteristicConfigurationDescriptorValue.Indicate);
                                        if (returned == GattCommunicationStatus.Success)
                                        {
                                            AddMeasurementHandler(chat);
                                            Update_DeviceName(bluetoothLeDevice.DeviceInformation.Name, 0);
                                            return true;
                                        }
                                        else
                                        {
                                            Update_DeviceName("Characteristic Unreachable, retry", 1);
                                            return false;
                                        }
                                    }
                                    catch (UnauthorizedAccessException ex)
                                    {

                                        return false;
                                    }
                                }
                            }
                        }

                    }
                    bluetoothLeDevice.ConnectionStatusChanged -= ConnectionChanged;
                    bluetoothLeDevice?.Dispose();
                    Update_DeviceName("<Disconnected>", 2);
                    return false;
                }
            }

            bluetoothLeDevice.ConnectionStatusChanged -= ConnectionChanged;
            bluetoothLeDevice?.Dispose();
            Update_DeviceName("<Disconnected>", 2);
            return false;
        }

        private void AddMeasurementHandler(GattCharacteristic gatt)
        {
            registeredCharacteristic = gatt;
            registeredCharacteristic.ValueChanged += Characteristic_ValueChangedAsync;
            subscribedForNotifications = true;
        }
        private void Update_DeviceName(string Name, int warn)
        {
            System.Windows.Application.Current.Dispatcher.Invoke(() =>
            {
                Device.Text = Name;
                switch (warn)
                {
                    case 1:
                        Device.Foreground = Brushes.Yellow;
                        break;
                    case 2:
                        Device.Foreground = Brushes.Red;
                        break;
                    default:
                        Device.Foreground = Brushes.Green;
                        break;
                }
            });
        }

        private void Characteristic_ValueChangedAsync(GattCharacteristic sender, GattValueChangedEventArgs args)
        {
            // BT_Code: An Indicate or Notify reported that the value has changed.
            // Display the new value with a timestamp.
            var newValue = FormatValueByPresentation(args.CharacteristicValue);
            String message = $"Value at {DateTime.Now:hh:mm:ss.FFF}: {newValue}";
            System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
            {
                Values.Text = newValue.ToString();
            });
        }

        private async void ConnectionChanged(BluetoothLEDevice sender, object Obj)
        {
            if (sender == null)
            {
                return;
            }
            var cont = (sender.ConnectionStatus == BluetoothConnectionStatus.Connected);
            if (bluetoothLeDevice != null && sender.Name == bluetoothLeDevice.Name)
            {
                if (!cont)
                {
                    await ClearBluetoothLEDeviceAsync();
                }
                connected = cont;
            }
            else if (!cont)
            {
                await ClearBluetoothLEDeviceAsync();
                connected = false;
                if (!connecting && deviceQueue.Count > 0)
                {
                    await Task.WhenAny(ConnectDevice(), Task.Delay(timeout));
                }
            }
        }

        static string SplitReverse(string str, int chunkSize)
        {
            var revlist = Enumerable.Range(0, str.Length / chunkSize)
                .Select(i => str.Substring(i * chunkSize, chunkSize));
            revlist = revlist.Reverse();
            return string.Join("", revlist.ToArray());
        }

        private string FormatValueByPresentation(IBuffer buffer)
        {
            // BT_Code: For the purpose of this sample, this function converts only UInt32 and
            // UTF-8 buffers to readable text. It can be extended to support other formats if your app needs them.
            String strHex = CryptographicBuffer.EncodeToHexString(buffer);
            if (strHex != "")
            {
                strHex = SplitReverse(strHex, 2);
            }

            uint num = uint.Parse(strHex, System.Globalization.NumberStyles.AllowHexSpecifier);

            byte[] floatVals = BitConverter.GetBytes(num);
            float f = BitConverter.ToSingle(floatVals, 0);

            var inft = f / 0.3048;
            int ft = (int)inft;
            double temp = (inft - Math.Truncate(inft)) / 0.083333333333;
            int incher = (int)Math.Ceiling(temp);
            if (incher >= 12)
            {
                incher -= 12;
                ft += 1;
            }
            string left = temp.ToString("#.##");

            SendKeys.SendWait(ft.ToString());

            SendKeys.SendWait("{TAB}");

            SendKeys.SendWait(incher.ToString());

            SendKeys.SendWait("{ENTER}");

            return $"{ft} ft {left} in";
        }

        private void StartBleDeviceWatcher()
        {

            // Additional properties we would like about the device.
            // Property strings are documented here https://msdn.microsoft.com/en-us/library/windows/desktop/ff521659(v=vs.85).aspx
            string[] requestedProperties = { "System.Devices.Aep.DeviceAddress", "System.Devices.Aep.IsConnected", "System.Devices.Aep.Bluetooth.Le.IsConnectable" };

            // BT_Code: Example showing paired and non-paired in a single query.
            string aqsAllBluetoothLEDevices = "(System.Devices.Aep.ProtocolId:=\"{bb7bb05e-5972-42b5-94fc-76eaa7084d49}\")";

            deviceWatcher =
                    DeviceInformation.CreateWatcher(
                        aqsAllBluetoothLEDevices,
                        requestedProperties,
                        DeviceInformationKind.AssociationEndpoint);

            // Register event handlers before starting the watcher.
            deviceWatcher.Added += DeviceWatcher_Added;
            deviceWatcher.Updated += DeviceWatcher_Updated;
            deviceWatcher.Removed += DeviceWatcher_Removed;
            deviceWatcher.Stopped += DeviceWatcher_Stopped;

            // Start over with an empty collection.
            KnownDevices.Clear();
            UnknownDevices.Clear();
            dict.Clear();

            // Start the watcher.
            deviceWatcher.Start();
        }
        private async Task<bool> StopBleDeviceWatcherAsync()
        {
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                lock (this)
                {
                    if (deviceWatcher != null)
                    {
                        // Unregister the event handlers.
                        deviceWatcher.Added -= DeviceWatcher_Added;
                        deviceWatcher.Updated -= DeviceWatcher_Updated;
                        deviceWatcher.Removed -= DeviceWatcher_Removed;
                        deviceWatcher.Stopped -= DeviceWatcher_Stopped;

                        // Stop the watcher.

                        deviceWatcher.Stop();
                        deviceWatcher = null;

                    }
                }
            }));
            return true;
        }
        private async void DeviceWatcher_Added(DeviceWatcher sender, DeviceInformation deviceInfo)
        {
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                lock (this)
                {
                    if (sender == deviceWatcher)
                    {
                        // Make sure device isn't already present in the list.
                        if (FindBluetoothLEDeviceDisplay(deviceInfo.Id) == null)
                        {
                            if (deviceInfo.Name.Length > 4 && deviceInfo.Name.Substring(0, 5) == prefName)
                            {
                                if (!dict.ContainsKey(deviceInfo.Name))
                                {
                                    dict.Add(deviceInfo.Name, deviceInfo);
                                }
                                else if (dict.ContainsKey(deviceInfo.Name))
                                {
                                    dict[deviceInfo.Name] = deviceInfo;
                                }
                                DeviceList.Items.Add(new System.Windows.Controls.ListViewItem { Content = deviceInfo.Name });
                                KnownDevices.Add(new BluetoothLEDeviceDisplay(deviceInfo));
                                deviceQueue.Enqueue(deviceInfo.Name);
                                if (!connected && !connecting)
                                {
                                    ConnectDevice();
                                }
                            }
                        }
                        else
                        {
                            // Add it to a list in case the name gets updated later. 
                            UnknownDevices.Add(deviceInfo);
                        }
                        Update_DeviceList();
                    }
                }
            }));
        }
        private async void DeviceWatcher_Updated(DeviceWatcher sender, DeviceInformationUpdate deviceInfoUpdate)
        {
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                lock (this)
                {
                    if (sender == deviceWatcher)
                    {
                        BluetoothLEDeviceDisplay bleDeviceDisplay = FindBluetoothLEDeviceDisplay(deviceInfoUpdate.Id);
                        if (bleDeviceDisplay != null)
                        {
                            // Device is already being displayed - update UX.
                            bleDeviceDisplay.Update(deviceInfoUpdate);
                            return;
                        }

                        DeviceInformation deviceInfo = FindUnknownDevices(deviceInfoUpdate.Id);
                        if (deviceInfo != null)
                        {
                            deviceInfo.Update(deviceInfoUpdate);
                            // If device has been updated with a friendly name it's no longer unknown.
                            if (deviceInfo.Name != String.Empty)
                            {
                                dict.Add(deviceInfo.Name, deviceInfo);
                                DeviceList.Items.Add(new System.Windows.Controls.ListViewItem { Content = deviceInfo.Name });
                                KnownDevices.Add(new BluetoothLEDeviceDisplay(deviceInfo));
                                deviceQueue.Enqueue(deviceInfo.Name);
                                UnknownDevices.Remove(deviceInfo);
                                ConnectDevice();
                            }
                        }
                        Update_DeviceList();
                    }
                }
            }));
        }

        private async void DeviceWatcher_EnumerationCompleted(DeviceWatcher sender, object e)
        {
            // We must update the collection on the UI thread because the collection is databound to a UI element.
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                // Protect against race condition if the task runs after the app stopped the deviceWatcher.
                if (sender == deviceWatcher)
                {
                    Console.Write("Device Enumeration Complete");
                }
            }));
        }

        private async void DeviceWatcher_Removed(DeviceWatcher sender, DeviceInformationUpdate deviceInfoUpdate)
        {
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                lock (this)
                {
                    if (sender == deviceWatcher)
                    {
                        // Find the corresponding DeviceInformation in the collection and remove it.
                        BluetoothLEDeviceDisplay bleDeviceDisplay = FindBluetoothLEDeviceDisplay(deviceInfoUpdate.Id);
                        DeviceInformation deviceInfo = FindUnknownDevices(deviceInfoUpdate.Id);
                        if (bleDeviceDisplay != null)
                        {
                            KnownDevices.Remove(bleDeviceDisplay);
                            dict.Remove(bleDeviceDisplay.Name);
                            if (deviceQueue.Count > 0)
                            {
                                while (deviceQueue.Contains(bleDeviceDisplay.Name))
                                {
                                    var ck = deviceQueue.Dequeue();
                                    if (!ck.Equals(bleDeviceDisplay.Name))
                                    {
                                        deviceQueue.Enqueue(ck);
                                    }
                                }
                            }
                        }
                        if (deviceInfo != null)
                        {
                            UnknownDevices.Remove(deviceInfo);
                        }
                        Update_DeviceList();
                    }
                }
            }));
        }

        private async void Update_DeviceList()
        {
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                DeviceList.Items.Clear();
                foreach (KeyValuePair<string, DeviceInformation> item in dict)
                {
                    Console.WriteLine("Key: {0}, Value: {1}", item.Key, item.Value);
                    DeviceList.Items.Add(new System.Windows.Controls.ListViewItem { Content = item.Key });
                }
            }));
        }

        private async void DeviceWatcher_Stopped(DeviceWatcher sender, object e)
        {
            await Dispatcher.BeginInvoke(DispatcherPriority.Normal, new Action(() =>
            {
                // Protect against race condition if the task runs after the app stopped the deviceWatcher.
                if (sender == deviceWatcher)
                {
                    Console.Write("No longer watching for devices");
                }
            }));
        }

        private async Task<bool> ClearBluetoothLEDeviceAsync()
        {
            if (clearing) {
                return true;
            }
            clearing = true;
            if (subscribedForNotifications)
            {
                try
                {
                    // Need to clear the CCCD from the remote device so we stop receiving notifications
                    if (bluetoothLeDevice != null && bluetoothLeDevice.ConnectionStatus.Equals(BluetoothConnectionStatus.Connected))
                    {
                        if (registeredCharacteristic != null)
                        {
                            var result = await registeredCharacteristic.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue.None);
                            registeredCharacteristic.ValueChanged -= Characteristic_ValueChangedAsync;
                            registeredCharacteristic = null;
                            subscribedForNotifications = false;
                        }
                    }
                } catch (Exception e)
                {
                    registeredCharacteristic = null;
                    subscribedForNotifications = false;
                }
            }
            bluetoothLeDevice?.Dispose();
            connected = false;
            bluetoothLeDevice = null;
            clearing = false;
            return true;
        }

        private async void RemoveValueChangedHandler( )
        {
            if (subscribedForNotifications)
            {
                try
                {
                    if (bluetoothLeDevice != null && bluetoothLeDevice.ConnectionStatus.Equals(BluetoothConnectionStatus.Connected))
                    {
                        var result = await registeredCharacteristic.WriteClientCharacteristicConfigurationDescriptorAsync(GattClientCharacteristicConfigurationDescriptorValue.None);
                    }
                    registeredCharacteristic.ValueChanged -= Characteristic_ValueChangedAsync;
                } catch (Exception e)
                {

                }
                registeredCharacteristic = null;
                subscribedForNotifications = false;
            }
        }

        private BluetoothLEDeviceDisplay FindBluetoothLEDeviceDisplay(string id)
        {
            foreach (BluetoothLEDeviceDisplay bleDeviceDisplay in KnownDevices)
            {
                if (bleDeviceDisplay.Id == id)
                {
                    return bleDeviceDisplay;
                }
            }
            return null;
        }

        private DeviceInformation FindUnknownDevices(string id)
        {
            foreach (DeviceInformation bleDeviceInfo in UnknownDevices)
            {
                if (bleDeviceInfo.Id == id)
                {
                    return bleDeviceInfo;
                }
            }
            return null;
        }

        private void PageLoaded(object sender, RoutedEventArgs e)
        {
            if (deviceWatcher == null)
            {
                StartBleDeviceWatcher();
            }
        }

        private void ChangeDevice_Click(object sender, RoutedEventArgs e)
        {
            if (deviceWatcher == null)
            {
                StartBleDeviceWatcher();
            }
            SwitchView();
            Update_DeviceList();
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            SwitchView();
        }

        private void SwitchView()
        {
            if (changing)
            {
                changing = false;
                DeviceList.Visibility = Visibility.Collapsed;
                Cancel.Visibility = Visibility.Collapsed;
                Select.Visibility = Visibility.Collapsed;
                Padder.Visibility = Visibility.Collapsed;
                Reset.Visibility = Visibility.Collapsed;
                return;
            }
            else
            {
                changing = true;
                Cancel.Visibility = Visibility.Visible;
                Select.Visibility = Visibility.Visible;
                DeviceList.Visibility = Visibility.Visible;
                Padder.Visibility = Visibility.Visible;
                Reset.Visibility = Visibility.Visible;
                return;
            }
        }

        private async void Select_Click(object sender, RoutedEventArgs e)
        {
            if (DeviceList.SelectedItem == null)
            {
                return;
            }
            var selected = (DeviceList.SelectedItem as ListBoxItem).Content.ToString();
            if (selected.Length > 0 && dict.ContainsKey(selected))
            {
                if (bluetoothLeDevice != null)
                {
                    if (selected.Equals(bluetoothLeDevice.Name))
                    {
                        await Task.WhenAny(ConnectDevice(bluetoothLeDevice.DeviceInformation), Task.Delay(timeout));
                        return;
                    }
                    else if (await ClearBluetoothLEDeviceAsync())
                    {
                        SwitchView();
                        Update_DeviceName($"- Connecting to {selected} -", 1);

                        await Task.WhenAny(ConnectDevice(dict[selected]), Task.Delay(timeout));
                        
                    }
                } else
                {
                    await Task.WhenAny(ConnectDevice(dict[selected]), Task.Delay(timeout));
                }
                
            } else
            {
                Console.WriteLine("No selection");
            }

        }

        private async void Window_Closing(object sender, CancelEventArgs e)
        {
            if (connected)
            {
                await ClearBluetoothLEDeviceAsync();
            }
            await StopBleDeviceWatcherAsync();
        }

        private void Reset_Click(object sender, RoutedEventArgs e)
        {

            Process.Start(System.Windows.Application.ResourceAssembly.Location);
            System.Windows.Application.Current.Shutdown();
        }
    }
    public class BluetoothLEDeviceDisplay : INotifyPropertyChanged
    {
        public BluetoothLEDeviceDisplay(DeviceInformation deviceInfoIn)
        {
            DeviceInformation = deviceInfoIn;
            UpdateGlyphBitmapImage();
        }

        public DeviceInformation DeviceInformation { get; private set; }

        public string Id => DeviceInformation.Id;
        public string Name => DeviceInformation.Name;
        public bool IsPaired => DeviceInformation.Pairing.IsPaired;
        public bool IsConnected => (bool?)DeviceInformation.Properties["System.Devices.Aep.IsConnected"] == true;
        public bool IsConnectable => (bool?)DeviceInformation.Properties["System.Devices.Aep.Bluetooth.Le.IsConnectable"] == true;

        public IReadOnlyDictionary<string, object> Properties => DeviceInformation.Properties;

        public BitmapImage GlyphBitmapImage { get; private set; }

        public event PropertyChangedEventHandler PropertyChanged;

        public void Update(DeviceInformationUpdate deviceInfoUpdate)
        {
            DeviceInformation.Update(deviceInfoUpdate);

            OnPropertyChanged("Id");
            OnPropertyChanged("Name");
            OnPropertyChanged("DeviceInformation");
            OnPropertyChanged("IsPaired");
            OnPropertyChanged("IsConnected");
            OnPropertyChanged("Properties");
            OnPropertyChanged("IsConnectable");

            UpdateGlyphBitmapImage();
        }

        private async void UpdateGlyphBitmapImage()
        {
            //DeviceThumbnail deviceThumbnail = await DeviceInformation.GetGlyphThumbnailAsync();
            //var glyphBitmapImage = new BitmapImage();
            //await glyphBitmapImag(deviceThumbnail);
            //GlyphBitmapImage = glyphBitmapImage;
            //OnPropertyChanged("GlyphBitmapImage");
        }

        protected void OnPropertyChanged(string name)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }
}