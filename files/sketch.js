var popu; //holds the Population object
let lifespan = 600; //var that holds the length a being can live
let count = 0; //counter for the genes array

var target; //where the beings are trying to reach
var obstacles = []; //holds all obstacles on screen
var obAmount = 20; //how many obstacles do you want?
var maxForce = 0.12;


//runs once, at beginning
function setup(){
	background(0);
	createCanvas(windowWidth, windowHeight); //create a canvas object, size of browser window
	console.log(width + " " + height)
	popu = new Population(); //create a new population of beings
	
	target = createVector(width/2, height/2); //give target a location
	
	for (var i = 0; i < obAmount; i++){
		var obbie = new Obstacle();
		obstacles.push(obbie);
	}
	
	
	
}

//loop function
function draw(){
	background(0, .9); //erase background
	//update and show the population
	popu.run();
	count++; //increase the gene array counter
	noStroke();
	//ellipse(target.x, target.y, 50, 50);
	
//	for (var i = 0; i < obstacles.length; i++){
//		obstacles[i].show();
//	}
	
	if (count == lifespan){
		popu.eval();
		popu.selection();
		//popu = new Population();
		count = 0;
	}
	
	
}

//Smart Being class
function Being(dna){
	//vectors objects contain an x and y variable
	this.pos = createVector(0, height); //create vector object for position
	this.vel = createVector(); //start each being's velocity at 0	
	this.acc = createVector(); //create vector for acceleration
	//acceleration is controlled by the environment or the object's properties
	this.completed = false; //boolean for when a being reaches the target
	this.crashed = false;
	//each being can recieve DNA or generate random dna
	if (dna){ //if dna is sent to this contructor
		this.dna = dna; //assing it ot this being
	} else { //otherwise give it a random dna set
		this.dna = new DNA(); //each being has DNA that it learns from
	}
	this.fitness = 0;
	
	//function to move the object
	this.addForce = function(force){
		//add the force to the acceleration
		this.acc.add(force);
	}
	
	//update objects movement
	this.update = function(){
		//get distance from the being to the target
		var d  = dist(this.pos.x, this.pos.y, target.x, target.y);
		if (d < 25){
			this.completed = true; //if it reaches the target, completed is true
			this.pos = target.copy(); //if it reaches the target, its pos is the same as the targets
		}
		//check if it hit any obstacles
		for (var i = 0; i < obstacles.length; i++){
			
			if (this.pos.x > obstacles[i].posX && this.pos.x < obstacles[i].posX + obstacles[i].obWidth && this.pos.y > obstacles[i].posY && this.pos.y < obstacles[i].posY + obstacles[i].obHeight){
				//if it crashes, set the bool to true
				this.crashed  = true;
			}
			
			if (this.pos.x > width || this.pos.x < 0){
				this.crashed = true;
			}
			if (this.pos.y > height || this.pos.y < 0){
				this.crashed = true;
			}
			
			
		}
		
		this.addForce(this.dna.genes[count]); //apply each vector in the genes array to the being
		if (!this.completed && !this.crashed){ //check if it is completed or crashed
			this.vel.add(this.acc); //add acceleration to velocity
			this.pos.add(this.vel); //add velocity to the position
			this.acc.mult(0); //clear the acceleration so it doesn't keep adding to itself
			this.vel.limit(5); //so that they dont spiral out of control
		}
	}
	
	//display the object on the screen
	this.show = function(){
		push();//push and pop makes sure the tranlating wont effect other elements around the object
		translate(this.pos.x, this.pos.y); //this moves the object to its x and y pos
		rotate(this.vel.heading()); //heading() returns an angle, we can rotate the object towards its angle
		noStroke();
		rectMode(CENTER); //first two values are rects center x and y
		ellipse(0, 0, 10, 1);
		pop();
	}
	
	//calculate how well the being did
	this.calcFitness = function(){
		//calcualte how close the being was before it died
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);
		this.fitness = map(d, 0, width, width, 0); //further away the lower this number is
		if (this.completed){
			this.fitness *= 10;
		}
		if (this.crashed){ //if the being crashes, reset its fitness level
			this.fitness /= 10;
		}
		
	}

}

//DNA class is how the beings learn to avoid objects
function DNA(genes){
	if (genes){ //you can send the DNA class genes or have it randomly generate some
		this.genes = genes;
	} else {
		this.genes = []; //this array holds vectors, each being reads it and learns from it

		for (var i = 0; i < lifespan; i++){
			this.genes[i] = p5.Vector.random2D(); //give each gene index and random vector
			this.genes[i].setMag(maxForce); //sets a limit for force intensity
		}
	}
	
	this.cross = function(partner){ //recieves a DNA set
		var newgenes = []; //new childs DNA
		var mid = floor(random(this.genes.length)); //get a random midpoint to cross over genes
		
		for (var i = 0; i < this.genes.length; i++){ //go through its genes
			if (i > mid){ //if its above the mid
				newgenes[i] = this.genes[i]; //get this objects genes
			} else {
				newgenes[i] = partner.genes[i]; //otherwise get the partners
			}
		}
		return new DNA(newgenes);
	}
	
	//this function adds in a random vector to "mutate" the genes
	this.mutate = function(){
		for (var i = 0; i < this.genes.length; i++){
			if (random(1) < 0.01){
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
			
		}
		
	}
}

//this function makes a new population of Beings
function Population(){
	this.beings = []; //aray of beings
	this.size = 500; //population size
	this.pool = []; //this array holds the 
	
	//populate the beings array
	for (var i = 0; i < this.size; i++){
		this.beings[i] = new Being();
	}
	
	//updates and shows each being in the population
	this.run = function(){
		for (var i = 0; i < this.size; i++){
			this.beings[i].update();
			this.beings[i].show();
		}
	}
	
	//evaluates each being in the population
	this.eval = function(){
		
		var maxfit = 0; //standard for the best being
		for (var i = 0; i < this.size; i++){
			this.beings[i].calcFitness(); //checks how well the being did each run
			if (this.beings[i].fitness > maxfit){ //check for most fit
				maxfit = this.beings[i].fitness; //set max equal to it
			}
		}
		
		for (var i = 0; i < this.size; i++){
			this.beings[i].fitness /= maxfit; //normalizes the fitness values
		}
	
		this.pool = []; //clear the array each time the beings are evaluated
		for (var i = 0; i < this.size; i++){
			var n  = this.beings[i].fitness * 100; //work with fitness values between 0 and 100, not 0 and 1
			//the higher the value the more that being will be in the mating pool
			for (var j = 0; j < n; j++){ //add the being the amount of times equal to its fitness number
				this.pool.push(this.beings[i]); //add that being to the mating pool
			}
		}
		
	}
	
	//function that picks two appropirate parents
	this.selection = function(){
		var newBeings = [];
		for (var i = 0; i < this.beings.length; i++){
			//get two random parents dna from the pool
			var parA = random(this.pool).dna;
			var parB = random(this.pool).dna;
			//crossover the parents dna into the childs
			var child = parA.cross(parB);
			child.mutate();
			newBeings[i] = new Being(child);
		}
		this.beings = newBeings;
		
		
	}
}

//Class for creating obstacles to avoid
function Obstacle(){
	this.posX = random(100, width); //assign a random x and y location
	this.posY = random(100, height);
	//random sizes
	this.obWidth = random(20, 80);
	this.obHeight = random(20, 80);
	
	//function for drawing the obstacle
	this.show = function(){
		//rectMode(CENTER);
		noStroke();
		rect(this.posX, this.posY, this.obWidth, this.obHeight);
	}
}






