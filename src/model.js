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
        const existing = this.commands.find(a => a.name === name)
        if (existing) {
            return existing;
        }
        const created = new CommandInformation(name);
        this.commands.push(created)
        return created
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
        const existing = this.views.find(a => a.name === name)
        if (existing) {
            return existing;
        }
        const created = new ViewInformation(name);
        this.views.push(created)
        return created
    }

    getAggregate(name) {
        const existing = this.aggregates.find(a => a.name === name)
        if (existing) {
            return existing;
        }
        const created = new AggregateInformation(name);
        this.aggregates.push(created)
        return created
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

export class DiagramInformation {
    contexts = [];

    getContext(name) {
        const existing = this.contexts.find(a => a.name === name)
        if (existing) {
            return existing;
        }
        const created = new DiagramContext(name);
        this.contexts.push(created)
        return created
    }

    getWidthOffset(name) {
        const item = this.contexts.find(a => a.name === name)
        const index = this.contexts.indexOf(item)
        return this.contexts.slice(0, index).reduce((a, c) => a + c.width, 0)
    }

    getHeightOffset(name) {
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
