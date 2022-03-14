import {DiagramInformation} from "./model";


const contextRegex = /^context (.*)$/i
const modelRegex = /^(Saga|Aggregate|View|Agg|a|v|s) (.*) $/i
const definitionRegex = /^(.*)::(.*)$/i

export function parse(value ) {
    const lines = value.split("\n").filter(i => i.length > 0 && !i.startsWith('#'))
    let currentContext = null

    const diagram = new DiagramInformation();

    const getContext = () => diagram.getContext(currentContext)

    const addEventsToView = (view, events) => {
        events.map(i => i.trim()).forEach(e => getContext().getView(view).addEvent(e))

    }

    const addEventToCommand = (agg, command, event) => {
        getContext().getAggregate(agg).getCommand(command).addEvent(event.trim())
    }

    lines.forEach(line => {

        if (contextRegex.test(line)) {
            currentContext = contextRegex.exec(line)[1].trim()
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
                if (['v', 'view'].includes(type)) {
                    addEventsToView(name.trim(), reference.split(","));
                } else if (['a', 'agg', 'aggregate'].includes(type)) {
                    const parts = reference.split('->')
                    if (parts.length === 2) {
                        //valid definition
                        parts[1].split(",").forEach(i => addEventToCommand(name.trim(), parts[0].trim(), i))
                    }
                }
            } else {
                throw new Error("Invalid model definition")
            }
        }
    })

    diagram.pruneEmpty()

    return diagram
}
