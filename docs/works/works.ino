


size_t POS_MAX = 240;         // max position (+/-)
size_t BUFFERLEN = 64;        // temp buffer length

// buffers incoming serial data
// incoming commands are picked from here in FIFO manner
String serialBuffer = "";

int8_t posX = 0;
int8_t posY = 0;

char tempBuffer[64];

void setup()
{
  // Turn off the LED
  Bean.setLed(0, 0, 0);

  // To save power the Bean can sleep when it's not connected to another device.
  // Bean.enableWakeOnConnect(true);
  // Sleep forever or until the Bean wakes up by being connected to
  // Bean.sleep(0xFFFFFFFF);
}

void command() {

}

void bufferSerialInput() {
  size_t length = BUFFERLEN - 1;

  length = Serial.readBytes(tempBuffer, length);    // read chunk of pending data
  tempBuffer[length] = 0;                           // expects null-terminated string

  if ( length > 0 ) {
    serialBuffer += tempBuffer;                     // append the new data
  }
}

void scanSerialInput() {
  tempBuffer[0] = 0;

  size_t lineEnd = serialBuffer.indexOf( "\n" );    // look for newline demarc char

  if (lineEnd > 0) {
    if (lineEnd < BUFFERLEN) {
      // read single command into tempBuffer
      serialBuffer.substring(0, lineEnd).toCharArray(tempBuffer, BUFFERLEN);
    }

    // strip command from serialBuffer
    serialBuffer = serialBuffer.substring(lineEnd + 1, serialBuffer.length() + 1);
  }
}

void loop()
{
  bool connected = Bean.getConnectionState();

  if(connected)
  {
    bufferSerialInput();
    scanSerialInput();

    if ( !strncmp( tempBuffer, "C/", 2 ) )
    {
      char *tok = tempBuffer;
      char *param = NULL;
      param = strtok_r( tok, "/", &tok );             // first is the "C" command
      int8_t r = atoi( strtok_r( tok, "/", &tok ) );
      int8_t g = atoi( strtok_r( tok, "/", &tok ) );
      int8_t b = atoi( strtok_r( tok, "/", &tok ) );

      Bean.setLed(r, g, b);
    }

    Bean.sleep(50);
  } else {
    // blink the LED
    Bean.setLed(128, 0, 0);
    // Bean.sleep(50);
    Bean.setLed(0, 0, 0);
    // Sleep for 5s or until a data event occurs
    Bean.sleep(5000);
  }
}