/*
	Simple Example that connects to an Arduino (via TinkerProxy) and controls
	the blinking of an LED.
	
	Created by Mike Chambers
	http://www.mikechambers.com
	
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
	import flash.events.Event;
	import flash.display.Sprite;
	import flash.net.Socket;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.utils.Endian;
	import flash.events.MouseEvent;
	
	public class FlashBlink extends Sprite
	{
		
		//command sent to the Arduino to toggle LED blinking state
		private static const TOGGLE_LED_STATE:String = "t";
		
		//Character that delineates the end of a message received
		//from the Arduino
		private static const EOL_DELIMITER:String = "\n";
		
		//socket we will use to connect to TinkerProxy
		private var _socket:Socket;
		
		//Address where TinkerProxy is located. Will usually be
		//localhost / 127.0.0.1
		private var _proxyAddress:String = "127.0.0.1";
		
		//port TinkerProxy is listening on
		private var _proxyPort:uint = 5331;
		
		//constructor
		public function FlashBlink()
		{
			//listen for when we are added to the stage
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(event:Event):void
		{
			removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			
			//create a Sprite to add to the stage.
			//This will be a simple button
			var s:Sprite = new Sprite();
			
			//draw a green square in the Sprite
			s.graphics.beginFill(0x00FF00);
			s.graphics.drawRect(0,0, 200,100);
			s.graphics.endFill();
			
			//Add Sprite to the display list
			addChild(s);
			
			//position it
			s.x = 50;
			s.y = 50;
			
			//listen for when the user clicks the Sprite
			s.addEventListener(MouseEvent.CLICK, onClick);
			
			_socket = new Socket();

			//Register for socket events
			
			//socket connected
			_socket.addEventListener( Event.CONNECT, onConnect );			
			
			//socket closed
			_socket.addEventListener( Event.CLOSE, onClose );			
			
			//data received from socket
			_socket.addEventListener( ProgressEvent.SOCKET_DATA, onSocketData );
			
			//Error connecting
			_socket.addEventListener( IOErrorEvent.IO_ERROR, onIOError );
			
			//Security Error
			_socket.addEventListener( SecurityErrorEvent.SECURITY_ERROR, onSecurityError );
			
			//need to set Endianness for Socket. THIS IS IMPORTANT
			//If this is set incorrectly, the Arduino will not be able to understand
			//all of the data sent from Flash. 
			//
			//See:
			//http://www.mikechambers.com/blog/2010/08/01/sending-multibyte-numbers-from-actionscript-to-arduino/
			_socket.endian = Endian.LITTLE_ENDIAN;
			
			//connect
			_socket.connect(_proxyAddress, _proxyPort);
		}
		
		//called when we connect to the proxy server
		private function onConnect(event:Event):void
		{
			/*
				note, you cannot reliably write data to the socket here.
				
				Im not sure if this is a Flash player issue, or a timing issue
				with the proxy.
			*/
			trace("Socket Connected");
		}
		
		/*
			This function / event handler is called when data is received
			on the socket. 
			
			However, it is important to remember that the event is called as
			data is received, which means that not all of the data may be available
			when it is called.
			
			For example, if you sent the string "Hello World" from Arduino,
			then the event handler might be called twice. Once with "Hello Wo" and
			a second time with "rld".
			
			"Because of this, in most cases, you need to buffer the data, and parse
			out messages, looking for a character (that you specify) that delineates the
			end of a message.
			
			If you just want to send a single character back from Arduino, then this
			is not necessary. However, the handler below is generic, and already does all
			of the buffering, so you can just use it.
		*/
		
		//string to hold data as it comes in.
		private var buffer:String = "";
		
		//event called when data arrives on the socket from the
		//arduino
		private function onSocketData(event:ProgressEvent):void
		{
			//get the string sent from the Arduino. This could be any binary data
			//but in our case, we are sending strings.
			//In general, it is much easier to just always send strings from 
			//Arduino, and then parse then in ActionScript
			var data:String = _socket.readUTFBytes( _socket.bytesAvailable );
			
			//copy the newly arrived data into the buffer string.
			buffer += data;
			
			//completed message from the server
			var msg:String;
			var index:int;
			
			//loop through the buffer until it contains no more
			//end of message delimiter
			while((index = buffer.indexOf(EOL_DELIMITER)) > -1)
			{
				//extract the message from the beginning to where the delimiter is
				//we don't include the delimiter
				msg = buffer.substring(0, index);
				
				//remove the message from the buffer
				buffer = buffer.substring(index + 1);
				
				//trace out the message (or do whatever you want with it)
				trace("Message Received from Arduino : " + msg);
			}				
			
		}
		
		//called when the user clicks the button on stage
		private function onClick(event:MouseEvent):void
		{
			trace("onClick");
			
			//make sure we are connected to the socket
			if(!_socket.connected)
			{
				//if not, don't do anything
				trace("You must be connected to send a command to the Arduino.");
				return;
			}
			
			//write the command to the server
			_socket.writeUTFBytes(TOGGLE_LED_STATE);
			
			//flush the socket. Not really necessary, but here for forward compatibility.
			_socket.flush();
		}
		
		//called when the socket is closed
		private function onClose(event:Event):void
		{
			trace("Socket Closed");
		}
		
		//called if an error occurs while connecting to the socket.
		private function onIOError(event:IOErrorEvent):void
		{
			trace("IOErrorEvent : " + event.text);
		}
		
		//called when there is a security error. Usually if you try to connect to a socket
		//when the SWF doesn't have permission. 
		//See:
		//http://www.adobe.com/devnet/flashplayer/articles/fplayer9_security_04.html
		//In most cases, when testing locally, this will not be an issue.
		private function onSecurityError(event:SecurityErrorEvent):void
		{
			trace("SecurityErrorEvent : " + event.text);
		}
	}
}