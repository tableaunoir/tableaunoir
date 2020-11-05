# tableaunoir

Tableaunoir is an online blackboard tool. It can be used as a traditional blackboard but you can also create interactive animations via the use of "fridge magnets".
["Tableau noir" means blackboard in french](https://www.deepl.com/translator#fr/en/Tableau noir).
The online version is available here: [https://tableaunoir.github.io/] ([another one](http://tableaunoir.irisa.fr)


## Video

[https://www.youtube.com/watch?v=P6_lhqiPBow] (in French)
<img src="./photos/snapshot_from_1st_YouTube_video.jpg" alt="Showing the first image of the YouTube video https://www.youtube.com/watch?v=P6_lhqiPBow" width="300"/>

## Examples of use

Tableaunoir is used for teaching at ENS Rennes. The main advantage is that the screen is fully black: there are no buttons that annoy or distract the students (in my personal use, I simply hide the toolbar). Tableaunoir is controlled by a graphic tablet and by the keyboard of the computer (7 keys!). It makes it very interactive compared to fixed slides. 

### Photos in a lecture hall

<img src="./photos/tableaunoir_amphi.jpg" title="A photo showcasing the use of tableaunoir in a real course taught in an amphitheater (1/3)" alt="A photo showcasing the use of tableaunoir in a real course taught in an amphitheater (1/3)" width="300"/> <img src="./photos/tableaunoir_amphi2.jpg" title="A photo showcasing the use of tableaunoir in a real course taught in an amphitheater (2/3)" alt="A photo showcasing the use of tableaunoir in a real course taught in an amphitheater (2/3)" width="300"/> <img src="./photos/tableaunoir_amphi3.jpg" title="A photo showcasing the use of tableaunoir in a real course taught in an amphitheater (3/3)" alt="A photo showcasing the use of tableaunoir in a real course taught in an amphitheater (3/3)" width="300"/>

### Example of a course

<img src="./img/coursparcourslargeur.gif" alt="A small gif video showcasing the use of tableaunoir in a course on breadth-first search" width="680"/>

## Features

* Of course, you can draw and erase, with your mouse or a graphic tablet.
* You can also use kind of predefined fridge magnets that you can move on the board, to make animation e.g. for illustrating sorting algorithms, graphs algorithms etc (and even playing Go!).
* Create your own customized "fridge magnets" for interactive courses, by importing any image.
* Color palette for chalk (`c`, 7 colors  black/white ![#000000](https://placehold.it/15/000000/000000?text=+), yellow ![#FFFF00](https://placehold.it/15/FFFF00/000000?text=+), orange ![#FFA500](https://placehold.it/15/FFA500/000000?text=+), blue ![#64ACFF](https://placehold.it/15/64ACFF/000000?text=+), red ![#DC143C](https://placehold.it/15/DC143C/000000?text=+), pink ![#DDA0DD](https://placehold.it/15/DDA0DD/000000?text=+), green ![#32CD32](https://placehold.it/15/32CD32/000000?text=+)),
* Change the color of magnets' background,
* Load/Save the current board,
* Add texts (`Enter` and type), and move texts,
* Switch to a whiteboard instead of a blackboard,
* Collaborate and edit the same board at the same time (need a server for that),
* Change from right-handed (default) to left-handed cursor,
* Add as many new half-board as you need, going right with `→` and then left/right with `←/→` keyboard arrows.

You can teach online by sharing the screen with Discord, Zoom, Teams, etc, or by sharing a link (need a server for that).

## Screenshots

<img src="./img/screenshot.png" title="Screenshot of tableaunoir showcasing magnets to illustrate sorting algorithms" alt="Screenshot of tableaunoir showcasing magnets to illustrate sorting algorithms" width="300"/> <img src="./img/screenshot2.png" title="Screenshot of tableaunoir showcasing magnets to illustrate graph algorithms" alt="Screenshot of tableaunoir showcasing magnets to illustrate graph algorithms" width="150"/> <img src="./img/screenshot3.png" title="Screenshot of tableaunoir showcasing magnets to illustrate B-tree algorithms" alt="Screenshot of tableaunoir showcasing magnets to illustrate B-tree algorithms" width="300"/> <img src="./img/simcitygraph.png" title="Screenshot of tableaunoir showcasing magnets to illustrate large graph algorithms, using Sim City icons for nodes" alt="Screenshot of tableaunoir showcasing magnets to illustrate large graph algorithms, using Sim City icons for nodes" width="300"/> <img src="./img/euclide.png" title="Screenshot of tableaunoir showcasing a course using colors etc" alt="Screenshot of tableaunoir showcasing a course using colors etc" width="300"/> <img src="./img/screenshot_tablet.jpg" title="Screenshot of tableaunoir showcasing the latest toolbar, magnets, texts etc" alt="Screenshot of tableaunoir showcasing the latest toolbar, magnets, texts etc" width="300"/>

---

## Offline version

If you prefer to use an offline version, it is possible. You have to install [Electron](https://www.electronjs.org/) and then the application can be launched as follows (from the main directory):

```bash
$ electron mainElectron.js
```

## Create your own tableaunoir server

In order to share blackboards, you need a server. 
In the server, first `git clone` (and then later `git pull`) the project. Modify the variable `SERVERADRESS` in `js/share.js` to be the address of your server (eg `1.2.3.4`). Install Apache HTTPD to deploy `index.html` (other web servers might work too, but have not been tested).
Install the dependencies for the server, see [`server/INSTALL.md`](server/INSTALL.md).
Then `server/run.sh`.

---

## [License](https://github.com/tableaunoir/tableaunoir.github.io/blob/master/LICENSE)
This software is open-source under [the GPLv3.0 license](https://github.com/tableaunoir/tableaunoir.github.io/blob/master/LICENSE).

## Credits
- Some pictures come from [@nicholas-ochoa/OpenSC2K](https://github.com/nicholas-ochoa/OpenSC2K), an open-source clone of Sim City 2000.
