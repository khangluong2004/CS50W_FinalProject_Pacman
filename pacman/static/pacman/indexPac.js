const SQUARE_SIZE = 40;

// Add jigger to overlay the jiggering at the edge of the circle when erase
const JIGGER = 0;

const PACMAN_SIZE = SQUARE_SIZE * 0.4 - JIGGER;
const PELLET_SIZE = 3;


const VELOCITY_UNIT = 6;
const GHOST_VELOCITY = VELOCITY_UNIT * 0.7;

// Add momentum to smooth ghost movement
const GHOST_MOMENTUM = 15;

let MAX_HEIGHT = 0;
let MAX_WIDTH = 0;

// Base Player
class Player {
    constructor(position, velocity, walls_bound, context){
        this.position = position;
        this.context = context;
        this.velocity = velocity;
        this.radius = PACMAN_SIZE;
        this.walls_bound = walls_bound;
    }

    draw(colour = "yellow", radius = -1){
        if (radius == -1){
            radius = this.radius;
        }

        this.context.beginPath();
        this.context.arc(this.position.x, this.position.y, radius,
            0, Math.PI * 2);
        this.context.fillStyle = colour;
        this.context.fill();
        this.context.closePath();
    }

    // Fill the circle with the same colour as the background
    erase(){
        this.draw("black", this.radius + JIGGER);
    }

    test_bounds(velocity){
        let new_x = this.position.x + velocity.x;
        let left_x = new_x - PACMAN_SIZE - JIGGER;
        let right_x = new_x + PACMAN_SIZE + JIGGER;

        let new_y = this.position.y + velocity.y;
        let top_y = new_y - PACMAN_SIZE - JIGGER;
        let bottom_y = new_y + PACMAN_SIZE + JIGGER;

        // console.log(`Left x: ${left_x}, Right x: ${right_x}`);
        // console.log(`Top y: ${top_y}, Bottom y: ${bottom_y}`);
        
        // Check that still inside the canvas
        if (new_x >= MAX_WIDTH || new_x < 0 || 
            new_y >= MAX_HEIGHT || new_y < 0){
            return false;
        }

        // Check if going to go "inside any walls"
        for (let i = 0; i < this.walls_bound.length; i++){
            let wall = this.walls_bound[i];

            if (((wall.x.low <= left_x && left_x <= wall.x.high) ||
                (wall.x.low <= right_x && right_x <= wall.x.high))
                && 
                ((wall.y.low <= top_y && top_y <= wall.y.high) ||
                (wall.y.low <= bottom_y && bottom_y <= wall.y.high))){
                return false;
            }
        }

        return true;
    }

    update_velocity(new_vel){
        this.velocity.x = new_vel.x;
        this.velocity.y = new_vel.y;
    }
}


// Player pacman
class Pacman extends Player {
    constructor(position, velocity, walls_bound, pellets_position, pellets_delete, context){
        super(position, velocity, walls_bound, context);
        this.score = 0;
        this.pellets_position = pellets_position;
        this.pellets_delete = pellets_delete;
    }

    check_edible_pellet(pellet_position){
        let distance_sqr = (pellet_position.x - this.position.x) * (pellet_position.x - this.position.x)
        + (pellet_position.y - this.position.y) * (pellet_position.y - this.position.y);

        return distance_sqr < ((PACMAN_SIZE - PELLET_SIZE) * (PACMAN_SIZE - PELLET_SIZE));
    }

    eat_pellet(){
        for (let i=0; i < this.pellets_position.length; i++){
            let pellet = this.pellets_position[i];
            
            if (this.pellets_delete[pellet.grid_x][pellet.grid_y]){
                continue;
            }

            if (this.check_edible_pellet(pellet)){
                this.pellets_delete[pellet.grid_x][pellet.grid_y] = true;
                this.score += 5;
                console.log("Just eat pellet");
                console.log(this.score);
            }
        }
    }

    move(){
        // Guard against moving outside the canvas or inside the wall
        if (!this.test_bounds(this.velocity)){
            this.draw();
            return;
        }

        this.eat_pellet();

        // this.erase();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw();
    }
}

class Ghost extends Player {
    constructor(position, velocity, walls_bound, context){
        super(position, velocity, walls_bound, context);
        this.directions = [
            {x: GHOST_VELOCITY, y: 0}, 
            {x: 0, y: GHOST_VELOCITY},
            {x: -GHOST_VELOCITY, y: 0},
            {x: 0, y: -GHOST_VELOCITY}
        ];
        this.opposite = [2, 3, 0, 1];
        this.last_direction = -1;
        this.momentum = GHOST_MOMENTUM;
    }

    distance(pacman_position, ghost_position){
        let diff_x = pacman_position.x - ghost_position.x;
        let diff_y = pacman_position.y - ghost_position.y;
        return Math.abs(diff_x) + Math.abs(diff_y);
    }    

    find_direction(pacman_position){
        let possible = [];
        for (let i=0; i < this.directions.length; i++){
            let dir = this.directions[i];
            if (this.test_bounds(dir)){
                possible.push(i);
            }          
        }


        // Check if only 1 possible move
        if (possible.length == 1){
            this.update_velocity(this.directions[possible[0]]);
            this.last_direction = possible[0];
            return;   
        }

        // Otherwise, pick one that gets closer to pacman and not the
        // opposite of last move
        let min_diff = -1;
        let min_post = -1;

        for (let i=0; i < possible.length; i++){
            if (possible[i] == this.opposite[this.last_direction]){
                continue;
            }

            if (possible[i] == this.last_direction && this.momentum > 0){
                this.momentum--;
                return;
            }

            let pre_dist = this.distance(pacman_position, this.position);

            let new_position = {x: 0, y: 0};
            let check_dir = this.directions[possible[i]];

            new_position.x = this.position.x + check_dir.x;
            new_position.y = this.position.y + check_dir.y;

            let new_dist = this.distance(pacman_position, new_position);

            if (min_post == -1){
                min_diff = new_dist - pre_dist;
                min_post = i;
            } else {
                let new_diff = new_dist - pre_dist;

                if (new_diff < min_diff){
                    min_diff = new_diff;
                    min_post = i;
                }
            }
        }

        this.update_velocity(this.directions[possible[min_post]]);
        this.last_direction = possible[min_post];

        if (this.momentum == 0){
            this.momentum = GHOST_MOMENTUM;
        }

        // console.log("Chosen direction: ");
        // console.log(possible[min_post]);
        // console.log("Last direction");
        // console.log(this.last_direction);

        return;
    }

    move(pacman_position){
        this.find_direction(pacman_position);
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.draw("red");
    }
}

// Game Pacman
class GamePac {
    constructor(canvas, context){
        this.map = [];
        this.canvas = canvas;
        this.context = context;

        this.end = false;

        // Store the walls boundary for checking colliding to walls
        this.walls_bound = [];

        // Store the pellet position
        this.pellets_position = [];

        this.pellets_delete = [];

        this.player = null;

        this.player_position = null;

        this.ghost = null;

        this.ghost_position = null;

        this.animation = this.animation.bind(this);
    }

    // Walls: Drawing function
    // Walls of pacman
    draw_walls(position, width, height){
        this.context.fillStyle = 'blue';
        this.context.fillRect(position.x, position.y, width, height);
    }

    // Pellet: Drawing function
    // Pellets of pacman
    draw_pellet(position, context){
        context.beginPath();
        context.arc(position.x, position.y, PELLET_SIZE, 0, Math.PI * 2);
        context.fillStyle = "white";
        context.fill();
        context.closePath();
    }

    init_boundaries(){
        for (let i=0; i < this.map.length; i++){
            for (let j = 0; j < this.map[0].length; j++){
                if (this.map[i][j] == "-"){
                    let x_post = j * SQUARE_SIZE;
                    let y_post = i * SQUARE_SIZE;

                    this.walls_bound.push({
                        x: {low: x_post, high: x_post + SQUARE_SIZE},
                        y: {low: y_post, high: y_post + SQUARE_SIZE}
                    })
                    
                } else if (this.map[i][j] == "."){
                    let x_post = j * SQUARE_SIZE + SQUARE_SIZE/2;
                    let y_post = i * SQUARE_SIZE + SQUARE_SIZE/2;

                    this.pellets_position.push({
                        x: x_post,
                        y: y_post,
                        grid_x: i,
                        grid_y: j
                    })
                }
            }
        }
    }

    init_players_walls_pellet(){
        // Draw the walls and construct the boundary list
        for (let i=0; i < this.map.length; i++){
            for (let j = 0; j < this.map[0].length; j++){
                if (this.map[i][j] == "-"){
                    let x_post = j * SQUARE_SIZE;
                    let y_post = i * SQUARE_SIZE;

                    this.draw_walls({x: x_post, y: y_post}, SQUARE_SIZE, SQUARE_SIZE);
                } else if (this.map[i][j] == "." && !this.pellets_delete[i][j]){
                    let x_post = j * SQUARE_SIZE + SQUARE_SIZE/2;
                    let y_post = i * SQUARE_SIZE + SQUARE_SIZE/2;

                    this.draw_pellet({x: x_post, y: y_post}, this.context);
                } else if (this.player_position == null && this.map[i][j] == "c"){
                    let x_post = j * SQUARE_SIZE + SQUARE_SIZE/2;
                    let y_post = i * SQUARE_SIZE + SQUARE_SIZE/2;

                    this.player_position = {x: x_post, y: y_post};
                } else if (this.ghost_position == null && this.map[i][j] == "g"){
                    let x_post = j * SQUARE_SIZE + SQUARE_SIZE/2;
                    let y_post = i * SQUARE_SIZE + SQUARE_SIZE/2;

                    this.ghost_position = {x: x_post, y: y_post};
                }
            }
        }
    }

    init_buttons_listener(){
        // Detect key pressed and change velocity of pacman
        // Use wsad for movement
        let pac1 = this.player;

        // WASD Key for desktop

        window.addEventListener("keydown", event => {
            let key = event.key;

            if (key == "w"){
                pac1.velocity.y = -VELOCITY_UNIT;
                pac1.velocity.x = 0;
            } else if (key == "s"){
                pac1.velocity.y = VELOCITY_UNIT;
                pac1.velocity.x = 0;
            } else if (key == "a"){
                pac1.velocity.y = 0;
                pac1.velocity.x = -VELOCITY_UNIT;
            } else if (key == "d"){
                pac1.velocity.y = 0;
                pac1.velocity.x = VELOCITY_UNIT;
            }
        })

        // Mobile responsive: Detect button clicked for movement
        document.querySelector("#moveUp").onclick = (event) => {
            // console.log("Up Pressed");
            pac1.velocity.y = -VELOCITY_UNIT;
            pac1.velocity.x = 0;
        };

        document.querySelector("#moveDown").onclick = (event) => {
            // console.log("Down Pressed");
            pac1.velocity.y = VELOCITY_UNIT;
            pac1.velocity.x = 0;
        }

        document.querySelector("#moveRight").onclick = (event) => {
            // console.log("Right Pressed");
            pac1.velocity.y = 0;
            pac1.velocity.x = VELOCITY_UNIT;
        }

        document.querySelector("#moveLeft").onclick = (event) => {
            // console.log("Left Pressed");
            pac1.velocity.y = 0;
            pac1.velocity.x = -VELOCITY_UNIT;
        }
    }

    // Helper function to copy the middle section until it covers most of the 
    // height
    scale_map(start, mid, end){
        this.map = start;

        // Copy the middle section
        let max_mid = Math.floor((this.canvas.height - (SQUARE_SIZE * (start.length + end.length)))  / SQUARE_SIZE);
        for (let i = 0; i < max_mid; i++){
            this.map.push(mid[i % mid.length]);
        }
        
        // Add the end section
        for (let i=0; i < end.length; i++){
            this.map.push(end[i]);
        }
    }

    add_alternate_pattern(arr){
        for (let i=0; i < arr.length; i++){
            if (i % 3 == 0){
                arr[i].push('-');
            } else {
                arr[i].push('.');
            }
        }
    }


    init_map_and_pellet_states(){
        // Mobile responsive: Change map based on width and height
        let mid;
        let start;
        let end;

        if (this.canvas.width <= 1007){
            start = [
                ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                ['-', 'c', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '-']
            ];

            mid = [
                ['-', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '-'],
                ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '-'],
                ['-', '.', '.', '-', '-', '.', '.', '.', '.', '-', '-', '.', '.', '.', '.', '-', '-', '.', '.', '.', '.', '-', '-', '.', '-'],
                ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '-'],
                ['-', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '-']
            ];

            end = [
                ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'g', '-'],
                ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
            ];

        } else if (this.canvas.width >= 1008){
            start = [
                ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
                ['-', 'c', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.']
            ];

            mid = [
                ['-', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.'],
                ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
                ['-', '.', '.', '-', '-', '.', '.', '.', '.', '-', '-', '.', '.', '.', '.', '-', '-', '.', '.', '.', '.', '-', '-', '.', '.'],
                ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
                ['-', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.', '.', '-', '.']
            ];

            end = [
                ['-', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'g'],
                ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
            ];

            // Add alternate pattern to scale up any massive width
            let additional = Math.floor((this.canvas.width - SQUARE_SIZE * (start[0].length + 1)) / SQUARE_SIZE);

            for (let i=0; i < additional; i++){
                if (i % 3 == 0 || i % 3 == 1){
                    start.forEach(row => row.push('.'));
                    mid.forEach(row => row.push('.'));
                    end.forEach(row => row.push('.'));
                } else {
                    this.add_alternate_pattern(start);
                    this.add_alternate_pattern(mid);
                    this.add_alternate_pattern(end);                    
                }
            }

            // Add the final wall
            start.forEach(row => row.push('-'));
            mid.forEach(row => row.push('-'));
            end.forEach(row => row.push('-'));

            // Fix the top and bottom wall
            for (let i=0; i < start[0].length; i++){
                if (start[0][i] == '.'){
                    start[0][i] = '-';
                }

                if (end[end.length - 1][i] == '.'){
                    end[end.length - 1][i] = '-';
                }
            }
        }

        // Scale the map
        this.scale_map(start, mid, end);

        // Init pellet deletes based on map
        for (let i=0; i < this.map.length; i++){
            this.pellets_delete.push([]);
        }

        for (let i=0; i < this.map.length; i++){
            for (let j=0; j < this.map[0].length; j++){
                this.pellets_delete[i].push(false);
            }
        }
    }

    init_players(){
        // Draw player
        this.player = new Pacman(
            this.player_position,
            { x: 0, y: 0}, 
            this.walls_bound, 
            this.pellets_position, 
            this.pellets_delete, 
            this.context);

        this.player.draw();
        
        // Draw ghost
        this.ghost = new Ghost(
            this.ghost_position,
            {x: 0, y: 0},
            this.walls_bound,
            this.context
        );

        this.ghost.draw("red");
        console.log(this.ghost.position);
    }

    check_ghost_collision(){
        let diff_x = this.player.position.x - this.ghost.position.x;
        let diff_y = this.player.position.y - this.ghost.position.y;

        let dist_sqr = diff_x * diff_x + diff_y * diff_y;

        if (dist_sqr < PACMAN_SIZE * PACMAN_SIZE){
            return true;
        } else {
            return false;
        }
    }

    draw_frame(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.init_players_walls_pellet();
        this.player.move();
        this.ghost.move(this.player.position);
    }

    show_result(){
        document.querySelector("#scoreDisplay").innerHTML = `Score: ${this.player.score}`;
    }

    show_challenge(){
        let formDiv = document.querySelector("#challengeFormDiv"); 

        // Update the score
        let scoreInput = formDiv.querySelector("#score");
        scoreInput.value = this.player.score;

        // Display form
        formDiv.style.display = "flex";
    }

    // Infinite animation
    animation(){
        if (this.end == true){
            this.draw_frame();
            this.show_result();
            this.show_challenge();
            return;
        }

        requestAnimationFrame(this.animation);
        this.draw_frame();
        this.end = this.check_ghost_collision();
    }

    run(){
        // Init everything
        this.init_map_and_pellet_states();
        this.init_boundaries();

        this.init_players_walls_pellet();

        this.init_players();
        this.init_buttons_listener();
        
        // Start the animation/ game
        this.animation();
    }

}





document.addEventListener('DOMContentLoaded', function(){
    let canvas = document.querySelector('#myCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.7;

    MAX_HEIGHT = canvas.height;
    MAX_WIDTH = canvas.width;

    let context = canvas.getContext('2d');

    console.log(canvas.width);
    console.log(canvas.height);

    let game = new GamePac(canvas, context);

    game.run();

})