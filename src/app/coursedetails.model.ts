import { v4 as uuidv4 } from 'uuid';

export class Coursedetails {
    name : string;
    id : string;
    color : string;
    description : string = '';
    constructor(name : string, color : string) {
        this.name = name;
        this.color = color;
        this.id = uuidv4(); // Generate a unique id for each course
        this.description = `This is a course on ${name}`;
    }
}
