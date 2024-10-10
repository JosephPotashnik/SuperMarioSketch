export class Event 
{
    predicate;
    occurred;
    occurring;

    constructor(_pred)
    {
        this.predicate = _pred;
        this.occurred = false;
        this.occurring = false;
    }

    update()
    {
        if (this.occurring || (!this.occurred && this.predicate()))
        {  
            this.occurring = true;
        }

        return this.occurring;
    }

    endEvent()
    {
        this.occurred = true;
        this.occurring = false;
    }
}