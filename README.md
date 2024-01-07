# CS50W Final Project: Pacman Challenge

Youtube Demo link: https://youtu.be/1Fn6fmn-U3E

## Description:
A Pacman game (simplified with less fancy graphics but a harder ghost) on the Front-end, with the Challenge features supported by the Back-end for player to challenge each other.

4 main pages of the website:
1. Index: Where the pacman game is placed, along with a form to submit a challenge/ accept a challenge.
2. Profile: Show the player
3. Request sent: Contains the request sent (along with status)
4. Request received: Contains the request received with status or the button to accept the challenges

## Rules:
1. For Pacman: Normal rules: Eat the pellets for score, and avoid the red ghost. Use "WASD" keys to move, or use the movement buttons.
2. For Challenge: Once finished a pacman game, the player A can challenge some other player B. If B accepts and scores >= A's score in the challenge, then A loses that amount of score, while B gains the score. In reverse, A gains the amount of score, while B loses the amount.

A player's score in profile is only formed through score gain by challenging.

## Tech Stack:
1. Front End: Javascript, HTML, CSS (For Pacman Game and Challenge Form)
2. Backend: Django (To render pages, and deal with Challenge feature logic) + SQlite

## Distinctiveness and Complexity

### Distinctiveness: 
The project is completely different from all other course's projects, as it's neither social network nor e-commerce page, but rather an interactive game. The complexity will be emphasized in complexity sections, but the parts that stands out from previous project include (almost the entire project):

1. Pacman Game (Javascript Frontend): Completely different from all previous projects, with the manipulation of HTML canvas to "animate" the game, while incorporating OOP (to my best) to keep track of the states of the game, player and the ghost.

2. Challenge feature (Django Backend): The invitation features is distinct, allowing players to send challenge invitations, attempt the challenges and update the status of the challenge (and relevant players' score). This allows friends to compete with each other more easily.

### Complexity:

Satisfied complexity, mobile view and use at least 1 model requirement.

**FRONT-END (Javascript):**

Highly complex (and main) part of the project, using canvas to display the frame (showing the animation of the game). There are 4 main components:

1. Pacman Game: The top component containing the state of the games, initialize all other components (walls, pellets, player, ghost) based on the map, edit and display the frame and handle ending condition (when ghost collide with player).

2. Map: The game initial state is defined by a 2d-array map, which is generated based on the width and height of the screen (thus **mobile-responsive**), defining the wall, pellets, player and ghost initial position.

3. Pacman: The yellow circle changes direction based on detection of "WASD" key pressed or movements button clicked. Contains the state of the scores, update the pellet states to remove pellets after "eating" it and contains prevention code to avoid going inside the walls.

4. Ghost: The red circle with automatic movement toward the yellow circle through heuristic/ greedy search, by checking all 4 directions and pick the one that is:
    - Not go inside the wall (primary criteria)
    - Minimize the Manhattan distance (since ghost and player can only move in x and y axis directions) between ghost and Pacman player, if possible
    - If equal distance reduction, then randomize the direction chosen (preventing dead-end)

    Momentum is also used, forcing the ghost to repeat the chosen directions a RANDOM number of times (between 10 and 20), to smoothen the movement, prevent moving immediately to opposite direction and also allow the ghost to jump out/ squeeze in passage/ corner by randomizing the momentum. 

    Ghost cannot go through walls, just like player (thus they inherit the same base class). 

5. Walls: A series of consecutive blue squares that the ghost and player can't move through. 

6. Pellets: The white dot to be eaten by the pacman to earn scores (with a delete state used to keep track of remaining pellets)

**MOBILE RESPONSIVE FEATURES:**

1. Generated map based on the canvas/ screen width and height (thus displaying the map suited to all screen size).

2. Movement buttons: Allow mobile users to play (since they can't press WASD)

Other features are compatible with mobile view without any need for media queries

**BACKEND (Django):**

Login/ logout/ register is adapted from previous course's projects.

Manage the logic of the challenge features (and rendering pages). The API:
1. /: Index page - Render the main Pacman page (for playing and accept challange), and change accordingly based on GET parameter
2. /challenges/<str:mode> (with mode being "sent" or "received"): Render the page displaying all challenges sent/ received in reverse chronological order.
3. /challenges/services/send: API to create a challenge with information on sender, receiver, bet_score.
4. /challenges/services/update: API to send an "update" request by the receiver of the challenge with their score. The backend will determine who wins, and update the status with players' scores accordingly. 

**MODELS (SQLite):**

1. User: Inherit from Django's Abstract User, with added "score", "challenge_sent" and "challenge_win" attributes.
2. Challenges: Store the challenge sent and its status (whether the receiver attempted, and who wins), with: "sender", "receiver", "timestamp", "bet_score", "sender_win" and "finalized" attributes.

## How to run the project

1. Pull the code, and install django
2. Run "python manage.py runserver" to start, and access the page through the URL displayed.

## Explanations for each file
### Front End:

static:

1. indexPac.js: Store all the codes managing the Pacman game with 4 classes: Player (base class for Pacman and Ghost to inherit), Pacman (the class for the actual pacman player), Ghost (inherited from Player) and GamePac (class managing all states of the game). 
2. challenge.js: Store the code to set up the challenge form. Included in the index for playing/ challenging.
3. acceptChallenge.js: Store the code to set up the accept challenge form. Included in the index when opened for accepting challenges.

templates:

1. index.html: Containing the pacman games and challenge/accept challenge form.
2. challenge.html: Containing the template for the displaying of challenge sent/ received by the users. 
3. profile.html: For displaying user's stats (username, total score, total challenges sent, total challenges win).
2. login, register: Login and register template adapated from previous projects.
3. layout: The layout for all pages, including a taskbar, adapted from previous projects.

### Backend:

models.py: Containing the schema for Users and Challenges models (as described above).

views.py: Containing the logic for the API handling challenges function, as detailed in Complexity section.

The rest are common files for Django configurations.

## References:
No package is used, but the login/ logout/ register template is adapted from previous projects, yet should be acceptable as it's not the main feature of the project.


