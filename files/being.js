//Smart Being class
function Being(){
	//vectors objects contain an x and y variable
	this.pos = createVector(width/2, height); //create vector object for position
	this.vel = createVector(); //start each being's velocity at 0	
	this.acc = createVector(); //create vector for acceleration
	//acceleration is controlled by the environment or the object's properties
	this.dna = new DNA(); //each being has DNA that it learns from
	this.count = 0; //counter for the genes array
	
	//function to move the object
	this.addForce = function(force){
		//add the force to the acceleration
		this.acc.add(force);
	}
	
	//update objects movement
	this.update = function(){
		this.addForce(this.dna.genes[this.count]); //apply each vector in the genes array to the being
		this.count++; //increase the counter
		
		this.vel.add(this.acc); //add acceleration to velocity
		this.pos.add(this.vel); //add velocity to the position
		this.acc.mult(0); //clear the acceleration so it doesn't keep adding to itself
	}
	
	//display the object on the screen
	this.show = function(){
		push();//push and pop makes sure the tranlating wont effect other elements around the object
		translate(this.pos.x, this.pos.y); //this moves the object to its x and y pos
		rotate(this.vel.heading()); //heading() returns an angle, we can rotate the object towards its angle
		
		noStroke();
		
		rectMode(CENTER); //first two values are rects center x and y
		rect(0, 0, 25, 5);
		pop();
	}

}