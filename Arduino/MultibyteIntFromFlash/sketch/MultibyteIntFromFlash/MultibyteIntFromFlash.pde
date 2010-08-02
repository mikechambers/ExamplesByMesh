/*
        Example Created by Mike Chambers
        http://www.mikechambers.com
        
        with info from Arduino Forums:
        http://www.arduino.cc/cgi-bin/yabb2/YaBB.pl?num=1207242838

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

//union that we will use a union
//to construct the int
//from the individual bytes
//sent from Flash / ActionScript
union u_tag {
    byte b[2];
    int ival;
} u;

int value;

void setup()
{
  Serial.begin(9600);
}

void loop()
{  
  
  //this example assumes only int / short
  //are being sent. So we just look for data in 2 byte
  //increments
  if(Serial.available() > 1)
  {
    //read the 4 bytes into the union
    u.b[0] = Serial.read();
    u.b[1] = Serial.read();
    
    //retrieve the int value of the union
    //(based on the bytes passed in)
    value = u.ival;
  
    //send the reconstructed int back to the Serial
    //flash
    Serial.print(value, DEC);
    
    //write out a null byte, (the Flash Socket
    //class looks for this)
    Serial.print(0, BYTE);
  }
  
}
