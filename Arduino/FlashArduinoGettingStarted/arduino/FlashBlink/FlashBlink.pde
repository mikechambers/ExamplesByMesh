/*
	Simple example that controls the blinking of the LED
	connected to digital PIN 13.

	Created by Mike Chambers
	http://www.mikechambers.com

	You can hook up an external LED by connecting an LED
	to PIN 13 and GND (make sure that the anode (long leg) is
	connected to PING 13 and the cathode (short leg) is connected
	to GND.

	The on board LED is also connected to PIN 13, and will
	be controlled by this program.

	Example is released under the following license:

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


//The digital pin that the LED is connected to
#define LED_PIN 13

//incoming command to toggle LED blinking state
#define TOGGLE_LED_STATE 't'

#define EOL_DELIMETER "\n"

//int to hold incoming byte when we read it
int incoming = 0;

//whether the led should blink
boolean shouldBlinkLED = false;

//setup function. called when the program first runs
void setup()
{
	//start listening for incoming messages on the serial port
	//at 9600 baud
	Serial.begin(9600);

    //Send a message out that the program is initializing
    Serial.print("INITIALIZING");
        
    //Flash looks for this to know when the message is done
    //See the comments in the Flash file for more info.
    Serial.print(EOL_DELIMETER);
        
	//set the pin more for the digital ping that
	//the LED is connected to (can be INPUT or OUTPUT)
	pinMode(LED_PIN, OUTPUT);

	//blink the LED 5 times so we can visually see that the
	//program is running
	blinkLED(5);

    //Send out a message that initialization is complete.
    Serial.print("READY");
    Serial.print(EOL_DELIMETER);
}

//program loop. Called each timer tick (really fast)
void loop()
{
	//check if we should blink the LED
	if(shouldBlinkLED)
	{
		//if so, blink the LED
		blinkLED(1);
	}
  
	//check if there are any bytes available
	//on the Serial port
	if(Serial.available() > 0)
	{
		//read a single byte.
		incoming = Serial.read();
    

		//Calling Serial.read() remove the byte from the Serial
		//buffer. In this case, if there are multiple bytes that
		//were sent, the next one will be handled on the next loop.
		//You could also grab it by calling Serial.read() again
    
		//check if the incoming byte was a command to toggle
		//the state of the LED blinking
		if(incoming == TOGGLE_LED_STATE)
		{
			//it was a command
			
			//toggle the state of the LED Blinking
      		shouldBlinkLED = !shouldBlinkLED;
      
			//send a message to the Serial port with the 
			//new LED Blink state
       
			Serial.print("LED BLINK STATE: "); 
			if(shouldBlinkLED)
			{
				Serial.print("ON");
			}
        	else
        	{
          		Serial.print("OFF");
        	}
        
			Serial.print(EOL_DELIMETER);

			//note, if you are using XMLSocket in Flash to read
			//the string data over the socket then we also have to send 
			//a null byte with the following command:
			//
			//Serial.print(0, BYTE);
			//
			//However, in general, it is going to be easier, and more flexible
			//to use the Socket class (and not the XMLSocket class).
    	}
	}
}

//function to blink the LED
void blinkLED(int count)
{
	//loop through
	for(int i = 0; i < count; i++)
	{
		//turn LED on
    	digitalWrite(LED_PIN, HIGH);

		//wait 500 ms
    	delay(500);
	
		//turn LED off
    	digitalWrite(LED_PIN, LOW);

		//wait 500 ms
    	delay(500);
	}
}
