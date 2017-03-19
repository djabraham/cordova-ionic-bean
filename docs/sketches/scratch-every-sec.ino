/*
  Bean Scratch Demo
  Gets bean temperature every second and set scratch 2.
  Read scratch 1 and blink Led accordingly.
*/

void setup()
{
}

void loop()
{
  uint8_t buffer[1];
  buffer[0] = Bean.getTemperature();
  Bean.setScratchData(2, buffer, 1);

  ScratchData scratch1 = Bean.readScratchData(1);
  uint8_t n = scratch1.data[0];

  if (n != 0)
  {
    Bean.setLed(0, 128, 0);
    Bean.sleep(100);
    Bean.setLed(0, 0, 0);
  }
  Bean.sleep(1000);
}

