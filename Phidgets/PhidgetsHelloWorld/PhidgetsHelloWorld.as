/*
	The MIT License

	Copyright (c) 2010 Mike Chambers

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

package
{
	import flash.display.Sprite;
	import flash.events.Event;
	
	//import the Phidget classes we need for this example
	//from the Phidget's library / SWC
	import com.phidgets.Phidget;
	import com.phidgets.PhidgetInterfaceKit;
	import com.phidgets.events.PhidgetEvent;	
	
	public class PhidgetsHelloWorld extends Sprite
	{		
		
		//reference to the Phidget Interface Kit we are connecting to
		private var interfaceKit:PhidgetInterfaceKit;
		
		//constructor
		public function PhidgetsHelloWorld()
		{
			//listen for when we are added to the stage
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(e:Event):void
		{
			removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			
			//create instance of PhidgetInterfaceKit
			interfaceKit = new PhidgetInterfaceKit();

			//listen for event that we need for this example
			
			//connected to proxy
			interfaceKit.addEventListener(PhidgetEvent.CONNECT,	onConnect);
			
			//device attached
			interfaceKit.addEventListener(PhidgetEvent.ATTACH,	onAttach);
			
			//device detached
			interfaceKit.addEventListener(PhidgetEvent.DETACH,	onDetach);
			
			//disconnected from proxy
			interfaceKit.addEventListener(PhidgetEvent.DISCONNECT, onDisconnect);
			
			//proxy address. Usually localhost / 127.0.0.1, but can be any server
			//on any computer. The proxy returns proper security policy file
			var serverAddress:String = "127.0.0.1";
			
			//port the proxy is listening on
			var serverPort:uint = 5001;
			
			//connect to the proxy and device
			interfaceKit.open("127.0.0.1", 5001);
		}
		
		//called when we connect to the proxy server
		private function onConnect(e:PhidgetEvent):void
		{
			//note, we cannot access any devices here yet, since
			//we have not connected to them. You have to wait for the
			//onAttach event
			trace("-------onConnect------- ");
		}
		
		//called when we attach / connect to the actual Phidget
		private function onAttach(e:PhidgetEvent):void
		{
			trace("-------onAttach------- ");
			
			//get a reference to the device we connected to
			var device:Phidget = e.Device;
			
			//print out a bunch of information about it
			trace(device.Name + " : " + device.Label);
			trace("Version : " + device.Version);
			trace("Serial : " + device.serialNumber);
			
			
			//output number / pin that the LED is connected to
			var outputPin:uint = 0;
			
			//state to set the output pin. true = on, false = off
			var state:Boolean = true;
			
			//set the output state for pin 0 to true / on.
			//this will turn on the LED
			interfaceKit.setOutputState(outputPin, state);
			
			//note, you have to explicitly turn it off, or else
			//it will stay on, even after the program has stopped running
		}
		
		//called when a device is detached. i.e. the USB cable is disconnected
		//while the program is running
		private function onDetach(e:PhidgetEvent):void
		{
			//you cannot access the devices here.
			trace("-------onDetach------- ");
		}		
		
		//called once the connection to the proxy server is closed.
		private function onDisconnect(e:PhidgetEvent):void
		{
			//you cannot access the devices here
			trace("-------onAttach------- ");
		}
	}
}