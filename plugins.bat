@echo off

echo "Reinstalling Plugin cordova-plugin-ngbean"
Call cordova plugin rm cordova-plugin-ngbean
Call cordova plugin add https://github.com/djabraham/cordova-plugin-ngbean.git


