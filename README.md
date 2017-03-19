Cordova Ionic Bean
===

### Intro

Uses Cordova / Ionic 2 / AngularJS 2 / PunchThrough Bean SDK for Android.

![Screen Shot][1] &nbsp; ![Screen Shot][2]

  [1]: ./docs/images/scr-main.png
  [2]: ./docs/images/scr-capt.gif


Simple example of connecting to PunchThrough Bean from Android, or other platforms such as IOS.
AngularJS 2 is a javascript web development framework, that is familiar to many web developers.
Version 2 of Angular represents a major update, and TypeScript is used to help inform code editors.

Javascript applications are hosted by Cordova on platforms such as Android and IOS, and feel like
native applications. The Ionic framework is built on AngularJS and Cordova, and includes many
build tools and UI components that are ideal for mobile applications.

In this scenario, Javascript is used for presentation and requires native components to interact
with device / platform specific features. For Android paltform, the native code is written in Java.
The Bean developers have provided a Java based SDK that is called from a local plugin herein.

### Ionic -> AngularJS -> Cordova -> Android

The folder structure is necessarly complicated to facilitate a multi-layered, multi-platform
project and build system. The local bridge between Bean SDK and Javascript is in the following folder,
which is adjacent to other plugins that are downloaded from their respective repositories.

    /plugins/cordova-plugin-ptbean

### Required
- Java 1.8 / JDK 8
- Gradle 3.3
- Android SDK 19 (i.e. Android Studio 2.2.3)
- Android SDK Tools (sdkmanager for managing updates)
- Android Platform Tools (adb utility enables live debugging on Android devices)
- Ionic 2 Framework
- Cordova
- NodeJS

### Recommended
- VSCode (editor)

The web components depend on NPM (Node Package Manager). So you need to setup NodeJS:

[https://nodejs.org/en/](https://nodejs.org/en/)

    > npm --version
      3.10.10

Visual Studio Code (VSCode) is a recommended cross-platform code editor for javascript and other projects.

[https://code.visualstudio.com/](https://code.visualstudio.com/)

    > code .

Java JRE / JDK can be downloaded and installed per Oracle's instructions:

[http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html)

    > java -version
      java version "1.8.0_60"

Gradle depends on Java. It's a build tool used by Cordova / Ionic, and can be downloaded here:

[https://gradle.org/install](https://gradle.org/install)

Android Studio and Ionic should be installed after Java / Gradle:

[https://developer.android.com/studio/index.html](https://developer.android.com/studio/index.html)<br />
[https://developer.android.com/studio/index.html#downloads](https://developer.android.com/studio/index.html#downloads)<br />
[https://developer.android.com/studio/command-line/index.html](https://developer.android.com/studio/command-line/index.html)<br />
[https://developer.android.com/studio/command-line/sdkmanager.html](https://developer.android.com/studio/command-line/sdkmanager.html)<br />

Android Platform Tools may need to be installed separately, via sdkmanager. The sdkmanager is in the sdk/tools folder.

    > sdkmanager --list

    > sdkmanager "platforms;android-25"

The adb utility enables usb debugging via chrome. Run the adb server and check for devices. you must enable usb debugging on your Android device first.

    > adb start-server
      daemon not running. starting it now on port 5037
      daemon started successfully

    > adb devices
      List of devices attached
      TA9921DXCK      device

If you launch android session and see a message as follows, the adb server may have lost connectivity to the phone.
You should stop and start the adb server again, and check the settings on your phone to ensure USB debugging is on.

    > ionic run android

    No target specified and no devices found, deploying to emulator

    No emulator specified, defaulting to Nexus_5_API_21_x86

    Waiting for emulator to start...

    PANIC: Cannot find AVD system path. Please define ANDROID_SDK_ROOT

    > adb kill-server
    > adb start-server

Once a device is connected, navigate to the device debugger/inspector in Chrome.

[chrome://chrome-urls/](chrome://chrome-urls/)

[chrome://inspect/#devices](chrome://inspect/#devices)

Ionic docs are a great place to start, for setting up the full dev environment:

[http://ionicframework.com/docs/](http://ionicframework.com/docs/)

AngularJS 2.x Docs for TypeScript were also an important resource:

[https://angular.io/docs/ts/latest/](https://angular.io/docs/ts/latest/)

Don't forget to set environment variables needed by Ionic and put the bin folders in the path.

    > set ANDROID_HOME=C:\acme\Android\sdk
    > set JAVA_HOME=C:\acme\Java\jdk1.8.0_121
    > set PATH=%PATH%;C:\acme\Java\gradle_3.3\bin;C:\acme\Java\jdk1.8.0_121\bin;;C:\acme\nodejs\6.9.4\;C:\acme\Android\sdk\tools;C:\acme\Android\sdk\platform-tools;

Note that export should be used on linux / osx platforms. Keyin ```set``` on Windows, or ```env```
on Linux/OSX, to dump the current environment variables. Changes to the global settings on most platforms
typically require a console/terminal restart, while variables set in a batch/script file should take effect immediately.

Place this repository into a folder and run ionic commands to download external plugins and build the app.
In many cases, these Ionic commands are passed to Cordova cli verbatim, and in other cases they do a bit more
than Cordova would.

[http://ionicframework.com/docs/v2/cli/](http://ionicframework.com/docs/v2/cli/)<br />
[https://cordova.apache.org/docs/en/latest/guide/cli/index.html#link-5](https://cordova.apache.org/docs/en/latest/guide/cli/index.html#link-5)

Download external plugins, if this repo was just copied from github. These external projects are
not stored in the applications repo, and should automatically be installed during restore.

    > ionic state restore

For local browser experience (platform is unavailable or mocked). The app will automatically build
provided the changes are limited to javascript/angularjs.

    > ionic serve

For device experience, run the android build. Note that any changes to the local plugins/*
require platform ```remove``` and ```add``` to distribute those changes to the platforms/* folder.
These steps are not necessary when editing the javascript/angularjs app.

    > ionic platform remove android
    > ionic platform add android

    > ionic run android

To debug custom plugins, you can use the adb logcat. These commands will flush the log, then dump the log to a file.
The adb command can be found in the sdk\platform-tools folder of Android Studio. This tool is also used as a device
server, as shown previously.

    > adb logcat -c
    > adb logcat -d -v long > ../adb7.log

Search for PTBeanPlugin or PTBeanListener, which are tags used in the Java classes to create log entries.

To publish the app to the Play store, takes a great deal more effort. Although the debug
package can be distributed to others and installed on Android, provided their device settings allow it.

[https://ionicframework.com/docs/guide/publishing.html](https://ionicframework.com/docs/guide/publishing.html)

    > ionic build --release android

<br />
## References
[https://github.com/evothings/cordova-ble/blob/master/src/android/BLE.java](https://github.com/evothings/cordova-ble/blob/master/src/android/BLE.java)

[https://github.com/don/cordova-plugin-ble-central/blob/master/src/android/BLECentralPlugin.java](https://github.com/don/cordova-plugin-ble-central/blob/master/src/android/BLECentralPlugin.java)

[http://blog.instabug.com/2015/09/using-native-libraries-in-phonegap-a-diy-guide/](http://blog.instabug.com/2015/09/using-native-libraries-in-phonegap-a-diy-guide/)

[Cool project / deep dive https://www.codeproject.com/Articles/833916/LightBlueBeans](https://www.codeproject.com/Articles/833916/LightBlueBeans)

[http://beantalk.punchthrough.com/t/serial-interactivity-example/176/9](http://beantalk.punchthrough.com/t/serial-interactivity-example/176/9)