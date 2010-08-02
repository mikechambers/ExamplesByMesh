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

import flash.events.Event;
import flash.events.IOErrorEvent;
import flash.events.ProgressEvent;
import flash.events.SecurityErrorEvent;
import flash.net.Socket;
import flash.utils.Endian;

private static const PORT:uint = 5331;
private static const SERVER_ADDRESS:String = "127.0.0.1";

private var socket:Socket;

private function onApplicationComplete():void
{
	//only allow numbers, eriod and minus sign
	numberInput.restrict = ".0-9\\-";
	
	socket = new Socket()
	socket.addEventListener(Event.CONNECT, onConnect);
	socket.addEventListener(Event.CLOSE, onClose);
	socket.addEventListener( IOErrorEvent.IO_ERROR, onIOError );
	socket.addEventListener( SecurityErrorEvent.SECURITY_ERROR, onSecurityError );
	socket.addEventListener( ProgressEvent.SOCKET_DATA, onSocketData );
	
	//disable until we connect
	this.enabled = false;
	
	//this is important! If you dont set this to
	//little endian, then arduino wont understand
	//the bytes
	socket.endian = Endian.LITTLE_ENDIAN;
	
	socket.connect(SERVER_ADDRESS, PORT);
}

private function onSendClick():void
{
	//get the number that the user input
	var out:Number = Number(numberInput.text);
	
	//write it as a float to the server.
	//this is important.
	socket.writeFloat(out);
	
	//if number is too big, then it will overflow on
	//the arduino, and probably come back as 0.00000
}

private function onSocketData(e:ProgressEvent):void
{
	//note, you need to watch that the entire message from the server is here
	//it might not have all arrived.
	//We should be fine here since we are only receiving 4 bytes
	var data:String = socket.readUTFBytes( socket.bytesAvailable );
	log("onSocketData : " + data);
}


/***** socket handlers *******/

private function onConnect(e:Event):void
{
	log("Connected");
	this.enabled = true;
}

private function onClose(e:Event):void
{
	log("Socket Closed");
	this.enabled = false;
}

private function onIOError(e:IOErrorEvent):void
{
	log("onIOError : " + e.text);
	this.enabled = false;
}

private function onSecurityError(e:SecurityErrorEvent):void
{
	log("onSecurityError : " + e.text);
	this.enabled = false;
}

private function log(msg:String):void
{
	outputField.text += msg + "\n";
}
