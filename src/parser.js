import {DiagramInformation, Saga} from "./model";


const contextRegex = /^context (\w+)+(\s+\w+)*$/i
const modelRegex = /^(\w+)\s+(\w+)\s*$/i
const aliasRegex = /^(\w+)\s+(\w+)\s(\w+)\s*$/i
const definitionRegex = /^(.*)::(.*)$/i

const mappings = {
    saga: ['saga', 's'],
    context: ['context', 'cont', 'c'],
    aggregate: ['aggregate', 'agg', 'a'],
    view: ['view', 'vw', 'v'],
}

export function parse(value) {
    const lines = value.split("\n").filter(i => i.length > 0 && !i.startsWith('#')).map(l => l.trim())
    let currentContext = null

    const diagram = new DiagramInformation();

    const getContext = () => diagram.getContext(currentContext)

    const addEventsToView = (view, events) => {
        events.map(i => i.trim()).forEach(e => getContext().getView(view).addEvent(e))

    }

    const addEventToCommand = (agg, command, event) => {
        getContext().getAggregate(agg).getCommand(command).addEvent(event.trim())
    }

    const aliases = {
        context: {},
        aggregate: {},
        saga: {},
        view: {},
    }

    function resolveForAlias(type, name) {
        if (aliases[type][name.trim()]) {
            return aliases[type][name.trim()]
        }
        return name.trim()
    }

    lines.forEach(line => {

        if (contextRegex.test(line)) {
            const contextResult = contextRegex.exec(line);
            if (contextResult[2]) {
                aliases.context[contextResult[2].trim()] = contextResult[1].trim()
            }
            currentContext = contextResult[1].trim()
            return;
        }

        if (definitionRegex.test(line)) {
            const result = definitionRegex.exec(line)
            const model = result[1]
            const reference = result[2]
            // Check if is inline declaration
            if (modelRegex.test(model)) {
                const type = modelRegex.exec(model)[1].toLowerCase().trim()
                const name = modelRegex.exec(model)[2].trim()
                if (mappings.view.includes(type)) {
                    addEventsToView(resolveForAlias('view', name.trim()), reference.split(","));
                    return
                }
                if (mappings.aggregate.includes(type)) {
                    const parts = reference.split('->')
                    if (parts.length === 2) {
                        //valid definition
                        parts[1].split(",").forEach(i => addEventToCommand(resolveForAlias('aggregate', name.trim()), parts[0].trim(), i))
                    }
                    return
                }
                if(mappings.saga.includes(type)) {
                    const parts = reference.split('->')
                    if (parts.length === 2) {
                        const from = parts[0].trim().split(' ')
                        const to = parts[1].trim().split(' ')
                        if(from.length === 2 && to.length === 2) {
                            diagram.addSaga(new Saga(
                                name,
                                resolveForAlias('context', from[0].trim()),
                                from[1].trim(),
                                resolveForAlias('context', to[0].trim()),
                                to[1].trim(),
                            ))
                        }
                    }
                }
            }
            return;
        }

        if (aliasRegex.test(line)) {
            const [, type, name, alias] = aliasRegex.exec(line)
            console.log(type, name, alias)
            // Alias
            if (mappings.view.includes(type.toLowerCase())) {
                aliases.view[alias] = name
            }
            if (mappings.context.includes(type.toLowerCase())) {
                aliases.context[alias] = name
            }
            if (mappings.saga.includes(type.toLowerCase())) {
                aliases.saga[alias] = name
            }
            if (mappings.aggregate.includes(type.toLowerCase())) {
                aliases.aggregate[alias] = name
            }
        }
    })

    console.log(aliases)
    diagram.pruneEmpty()
    return diagram
}
