# tableaunoir

Tableaunoir is an online blackboard tool. It can be used as a traditional blackboard but you can also create interactive animations via the use of "fridge magnets".
"Tableau noir" means blackboard in french. The online version is available here:
[https://tableaunoir.github.io/]


## Video

[https://www.youtube.com/watch?v=P6_lhqiPBow] (in french)

## Example of use

Tableaunoir is used for teaching at ENS Rennes. The main advantage is that the screen is fully black: there are no buttons that annoy the students (in my personal use, I simply hide the toolbar). Tableaunoir is controlled by a graphic tablet and by the keyboard of the computer (7 keys!). It makes it very interactive compared to fixed slides. 

###Photos in a lecture hall


<img src="./photos/coursparcourslargeur.gif" alt="photo" width="600"/>

###Example of a course

<img src="./img/courstableaunoir_amphi.jpg" alt="photo" width="300"/>

## Features

* Of course, you can draw and erase.
* You can also use kind of predefined fridge magnets that you can move on the board, to make animation e.g. for illustrating sorting algorithms, etc.
* Create your own customized "fridge magnets" for interactive courses.
* Color palette for chalk
* Change the color of magnets' background
* Load/Save the current board
* Add texts
* Switch to a whiteboard instead of a blackboard
* Collaborate and edit the same board at the same time (need a server for that)



You can teach online by sharing the screen with Discord, Zoom, Teams, etc., or by sharing a link (need a server for that).

## Screenshots

<img src="./img/screenshot.png" alt="screenshot" width="300"/> <img src="./img/screenshot2.png" alt="screenshot" width="150"/> <img src="./img/screenshot3.png" alt="screenshot" width="300"/>
<img src="./img/simcitygraph.png" alt="screenshot" width="300"/>
<img src="./img/euclide.png" alt="screenshot" width="300"/>
<img src="./img/screenshot_tablet.jpg" alt="screenshot" width="300"/>





## Offline version

If you prefer to use an offline version, it is possible. You have to install Electron and then the application can be launched as follows:

electron mainElectron.js



## Create your own tableaunoir server

In order to share blackboards, you need a server. 
In the server, git pull the project. Modify the variable SERVERADRESS in js/share.js to be the address of your server. Install Apache to deploy index.html. Install the dependencies for the server see server/INSTALL.md. Then server/run.sh.

## Credits

Somes pictures come from [https://github.com/nicholas-ochoa/OpenSC2K].
