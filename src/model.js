function getItemPerNameOrCreate(arr, name, creator) {
    const existing = arr.find(a => a.name === name)
    if (existing) {
        return existing;
    }
    const created = creator();
    arr.push(created)
    return created
}

export class CommandInformation {
    constructor(name) {
        this.name = name
    }

    events = []

    addEvent(event) {
        if (this.events.indexOf(event) !== -1) {
            return;
        }
        this.events.push(event);
    }

    getWidth(context) {
        const views = this.getViews(context);
        if(this.events.length >= views.length + 1) {
            return this.events.length;
        }
        return this.events.length + views.length
    }

    getViews(context) {
        return context.views.filter(v => v.getEventsPresentOutOfEvents(this.events))
    }
}

export class AggregateInformation {
    constructor(name) {
        this.name = name
    }

    commands = []

    getCommand(name) {
        return getItemPerNameOrCreate(this.commands, name, () => new CommandInformation(name))
    }

    getWidth(context) {
        return this.commands.reduce((a, c) => a + c.getWidth(context), 0)
    }

    getWidthOffsetOfCommand(name, context) {
        const item = this.commands.find(a => a.name === name)
        const index = this.commands.indexOf(item)
        return this.commands.slice(0, index).reduce((a, c) => a + c.getWidth(context), 0)
    }
}

export class ViewInformation {
    constructor(name) {
        this.name = name
    }

    events = [];

    addEvent(event) {
        if (this.events.indexOf(event) > -1) {
            return;
        }
        this.events.push(event);
    }

    getEventsPresentOutOfEvents(events) {
        return this.events.filter(e => events.includes(e))
    }
}

export class DiagramContext {
    views = []
    aggregates = []

    constructor(name) {
        this.name = name;
    }

    getView(name) {
        return getItemPerNameOrCreate(this.views, name, () => new ViewInformation(name))
    }

    getAggregate(name) {
        return getItemPerNameOrCreate(this.aggregates, name, () => new AggregateInformation(name))
    }

    isEmpty() {
        return Object.keys(this.views).length === 0 && Object.keys(this.aggregates).length === 0
    }

    get width() {
        return this.aggregates.reduce((a, c) => a + c.getWidth(this), 0)
    }

    get height() {
        return this.aggregates.length
    }


    getWidthOffset(aggregateName) {
        const item = this.aggregates.find(a => a.name === aggregateName)
        console.log(item)
        const index = this.aggregates.indexOf(item)
        return this.aggregates.slice(0, index).reduce((a, c) => a + c.getWidth(this), 0)
    }
}

export class Saga {
    origins = [];
    destinations = [];

    constructor(name) {
        this.name = name
    }

    addOrigin(originContext, originEvent) {

    }
}

export class DiagramInformation {
    contexts = [];
    sagas = []

    getContext(name) {
        return getItemPerNameOrCreate(this.contexts, name, () => new DiagramContext(name))
    }

    getSaga(name) {
        return getItemPerNameOrCreate(this.sagas, name, () => new Saga(name))
    }


    getOffsetX(name) {
        const item = this.contexts.find(a => a.name === name)
        const index = this.contexts.indexOf(item)
        return this.contexts.slice(0, index).reduce((a, c) => a + c.width, 0)
    }

    getOffsetY(name) {
        const item = this.contexts.find(a => a.name === name)
        const index = this.contexts.indexOf(item)
        return this.contexts.slice(0, index).reduce((a, c) => a + c.height, 0)
    }

    pruneEmpty() {
        for (const context in this.contexts) {
            if (this.contexts[context].isEmpty()) {
                delete this.contexts[context]
            }
        }
    }
}
