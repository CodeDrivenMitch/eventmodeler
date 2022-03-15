function getItemPerNameOrCreate<T extends NamedElement>(arr: T[], name: string, creator: () => T): T {
    const existing = arr.find(a => a.name === name)
    if (existing) {
        return existing;
    }
    const created = creator();
    arr.push(created)
    return created
}

interface NamedElement {
    name: String
}

export class CommandInformation implements NamedElement {
    public name: string

    constructor(name: string) {
        this.name = name
    }

    events: string[] = []

    addEvent(event: string) {
        if (this.events.indexOf(event) !== -1) {
            return;
        }
        this.events.push(event);
    }

    getColumnSpan(context: DiagramContext) {
        const views = this.getViews(context);
        if (this.events.length >= views.length + 1) {
            return this.events.length;
        }
        return this.events.length + views.length
    }

    getViews(context: DiagramContext) {
        return context.views.filter(v => v.getEventsPresentOutOfEvents(this.events))
    }
}

export class AggregateInformation {
    public name: string

    constructor(name: string) {
        this.name = name
    }

    commands: CommandInformation[] = []

    getCommand(name: string): CommandInformation {
        return getItemPerNameOrCreate(this.commands, name, () => new CommandInformation(name))
    }

    getWidth(context: DiagramContext) {
        return this.commands.reduce((a, c) => a + c.getColumnSpan(context), 0)
    }

    getCommandsWithEvent(event: string) {
        return this.commands.filter(a => a.events.includes(event))
    }

    getWidthOffsetOfCommand(name: string, context: DiagramContext) {
        const item = this.commands.find(a => a.name === name)
        if (!item) {
            return null
        }
        const index = this.commands.indexOf(item)
        return this.commands.slice(0, index).reduce((a, c) => a + c.getColumnSpan(context), 0)
    }
}

export class ViewInformation {
    public name: string
    public events: string[] = [];

    constructor(name: string) {
        this.name = name
    }

    addEvent(event: string) {
        if (this.events.indexOf(event) > -1) {
            return;
        }
        this.events.push(event);
    }

    getEventsPresentOutOfEvents(events: string[]) {
        return this.events.filter(e => events.includes(e))
    }
}

export class DiagramContext {
    public name: string
    public views: ViewInformation[] = []
    public aggregates: AggregateInformation[] = []

    constructor(name: string) {
        this.name = name;
    }

    getView(name: string) {
        return getItemPerNameOrCreate(this.views, name, () => new ViewInformation(name))
    }

    getAggregate(name: string) {
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


    getAggregatesWithEvent(event: string) {
        return this.aggregates.filter(a => a.getCommandsWithEvent(event).length !== 0)
    }

    getAggregatesWithCommand(command: string) {
        return this.aggregates.filter(a => a.commands.filter(c => c.name === command).length > 0)
    }


    getWidthOffset(aggregateName: string) {
        const item = this.aggregates.find(a => a.name === aggregateName)!!
        const index = this.aggregates.indexOf(item)
        return this.aggregates.slice(0, index).reduce((a, c) => a + c.getWidth(this), 0)
    }
}

export class Saga {
    public name: string
    public originContext: string
    public originEvent: string
    public destinationContext: string
    public destinationCommand: string

    constructor(name: string,
                originContext: string,
                originEvent: string,
                destinationContext: string,
                destinationCommand: string) {
        this.name = name
        this.originContext = originContext
        this.originEvent = originEvent
        this.destinationContext = destinationContext
        this.destinationCommand = destinationCommand
    }

    isValid(context: DiagramInformation): boolean {
        return context.getContext(this.originContext).getAggregatesWithEvent(this.originEvent).length !== 0
            && context.getContext(this.destinationContext).getAggregatesWithCommand(this.destinationCommand).length !== 0
    }

    getColumnStart(model: DiagramInformation) {
        const context = model.getContext(this.originContext)!!;
        return context.getAggregatesWithEvent(this.originEvent)
            .map(a => {
                const commands = a.getCommandsWithEvent(this.originEvent)!!
                return model.getOffsetX(context.name) + context.getWidthOffset(a.name) + a.getWidthOffsetOfCommand(commands[commands.length - 1]!!.name, context)!! + 1
            })[0]
    }
}

export class DiagramInformation {
    public contexts: DiagramContext[] = [];
    public sagas: Saga[] = []

    getContext(name: string): DiagramContext {
        return getItemPerNameOrCreate(this.contexts, name, () => new DiagramContext(name))
    }

    addSaga(saga: Saga) {
        return this.sagas.push(saga)
    }

    getOffsetX(name: string) {
        const item = this.contexts.find(a => a.name === name)!!
        const index = this.contexts.indexOf(item)
        return this.contexts.slice(0, index).reduce((a, c) => a + c.width, 0)
    }

    getOffsetY(name: string) {
        const item = this.contexts.find(a => a.name === name)!!
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
