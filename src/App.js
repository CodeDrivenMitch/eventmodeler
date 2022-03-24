import './App.css';
import './theme.scss'
import {Accordion, Col, Container, Navbar, NavbarBrand, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {Arrow, Group, Layer, Rect, Stage, Text} from "react-konva";
import {defaultValue} from './defaultvalue'
import {parse} from './parser'
import SplitPane from "react-split-pane";
import RangeSlider from 'react-bootstrap-range-slider';

function App() {
    const [value, setValue] = useState(defaultValue)
    const [width, setWidth] = useState(120);
    const [padding, setPadding] = useState(10);
    const [fontSize, setFontSize] = useState(10);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    useEffect(() => {
        window.onresize = () => {
            setWindowHeight(window.innerHeight)
        }
    })

    const model = parse(value);
    const renderingOptions = {
        width,
        padding,
        fontSize,
        textPadding: 10
    }
    console.log(JSON.stringify(model, null, 4))
    return (
        <div className="App">
            <Navbar bg={"dark"} variant={"dark"}>
                <NavbarBrand style={{marginLeft: 10}}><img alt={"Axon Logo"} height={40}
                                                           src={"/axon_icon.svg"}/> AxonIQ Eventmodeler</NavbarBrand>
                <Navbar.Text style={{float: 'right'}}>Brough to you by the creators of Axon Framework</Navbar.Text>
            </Navbar>
            <Container fluid>
                <Row>
                    <Col md={12} style={{"textAlign": "left"}}>

                        <SplitPane minSize={100} allowResize={true} primary={"second"} split={"vertical"}
                                   defaultSize={window.innerWidth - 400} maxSize={window.innerWidth}
                                   style={{height: windowHeight - 70}}>
                            <div style={{
                                paddingTop: 30,
                                overflowY: 'scroll',
                                overflowX: 'hidden',
                                height: windowHeight - 70
                            }}>
                                <Accordion defaultActiveKey={['0', '2']} alwaysOpen>


                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Model definition</Accordion.Header>
                                        <Accordion.Body>
                                            <textarea
                                                style={{
                                                    "width": "98%",
                                                    "height": "70vh",
                                                    "fontSize": 14,
                                                    marginRight: '100px'
                                                }}
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}/>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>Eventmodeling Introduction</Accordion.Header>
                                        <Accordion.Body>
                                            <p>Eventmodeling is a great technique to explore your domain and create a
                                                functional Domain Driven Model for your Software based on commands and
                                                events. At AxonIQ we have a <a
                                                    href="https://developer.axoniq.io/w/from-model-to-code-event-modeling-axon-framework">great
                                                    introductory blog to get you started with the technique.</a></p>
                                            <p>This tool is meant to support you using the custom DSL we created. With
                                                this it should be easy to generate diagrams for your use-case. To get
                                                you started, let's go through the DSL.</p>

                                            <h5>Defining a context</h5>
                                            <p>You can define a context like this:</p>
                                            <pre>context MyContext</pre>
                                            <p>From now on, any definition that will come after this will belong to the
                                                MyContext context. If another context is declared, that one is now the
                                                active one.</p>

                                            <h4>Defining commands</h4>
                                            <p>We can also define commands. These are executed on aggregates. The syntax
                                                for declaring command X on Aggregate Y with the result of events Z1 and
                                                Z2 are as follows:</p>
                                            <pre>aggregate X :: Y -> Z1,Z2</pre>
                                            <p>Instead of aggregate, you can also write agg or a as shorthands.</p>

                                            <h4>Defining views</h4>
                                            <p>To visualize in which views the events are used, we can define that view
                                                X handles event Z1 and Z2 as follows:</p>
                                            <pre>view X :: Z1,Z2</pre>
                                            <p>Instead of view, you can also write v as shorthand.</p>

                                            <h4>Defining sagas</h4>
                                            <p>Lastly you can also define Sagas. Sagas start from event X and are
                                                handled by command Y. Since this can travel between contexts, we also
                                                need to provide the origin and target context, as follows:</p>
                                            <pre>saga X :: originContext event -> destinationContext command</pre>

                                            <h4>Aliases</h4>
                                            <p>You can also define aliases for certain objects. This is done like this:</p>
                                            <pre>type X Xalias</pre>
                                            <p>So, to define an alias ma for aggregate MyAggregate:</p>
                                            <pre>agg MyAggregate ma</pre>
                                            <p>With this you can now type ma instead of MyAggregate anywhere in the dsl. Other examples:</p>
                                            <pre>view Myview mv</pre>
                                            <pre>context Booking b</pre>
                                            <pre>agg MyAggregate ma</pre>
                                            <pre>s MySaga s</pre>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>Rendering options</Accordion.Header>
                                        <Accordion.Body>
                                            <p>Sticky width</p>
                                            <RangeSlider
                                                value={width}
                                                max={300}
                                                min={50}
                                                onChange={changeEvent => setWidth(parseInt(changeEvent.target.value))}
                                            />
                                            <p>Sticky padding</p>
                                            <RangeSlider
                                                value={padding}
                                                max={50}
                                                min={2}
                                                onChange={changeEvent => setPadding(parseInt(changeEvent.target.value))}
                                            />

                                            <p>Font size</p>
                                            <RangeSlider
                                                value={fontSize}
                                                max={50}
                                                min={2}
                                                onChange={changeEvent => setFontSize(parseInt(changeEvent.target.value))}
                                            />
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>

                            </div>
                            <div style={{
                                marginLeft: 20,
                                height: windowHeight - 70,
                                overflowY: 'scroll',
                                overflowX: 'scroll',
                                display: 'flex'
                            }}>
                                <DiagramEntities renderingOptions={renderingOptions} model={model}/>
                                <DiagramRendered renderingOptions={renderingOptions} model={model}/>
                            </div>
                        </SplitPane>
                    </Col>
                </Row>

            </Container>
        </div>
    );
}

function Sticky({text, color, x, y, height = 76, fontSize = 14, renderingOptions}) {
    const width = renderingOptions.width - 2 * renderingOptions.padding
    const textWidth = width - renderingOptions.textPadding * 2

    return <Group x={x - renderingOptions.width * 0.5} y={y - height / 2}>
        <Rect width={width}
              height={height}
              fill={color}
              stroke="black"
              strokeWidth={1}
        />
        <Text width={textWidth}
              x={renderingOptions.textPadding}
              y={height / 2 - fontSize}
              align={"center"}
              lineHeight={1.3}
              text={text} fontSize={renderingOptions.fontSize}
        />
    </Group>
}


/**
 *
 * @param {DiagramInformation} model
 * @returns {JSX.Element}
 * @constructor
 */
function DiagramEntities({model, renderingOptions}) {
    return <Stage height={(model.getHeight() + 2) * rowHeight}
                  width={renderingOptions.width + renderingOptions.padding}>
        <Layer>
            {model.contexts.map(c => {
                return <ContextEntities key={c.name} model={model} context={c} renderingOptions={renderingOptions}/>
            })}
        </Layer>
    </Stage>
}


/**
 *
 * @param {DiagramInformation} model
 * @returns {JSX.Element}
 * @constructor
 */
function DiagramRendered({model, renderingOptions}) {
    return <Stage height={(model.getHeight() + 2) * rowHeight} width={(model.getWidth() + 2) * renderingOptions.width}>
        <Layer>
            {model.contexts.map(c => {
                return <Context key={c.name} model={model} context={c} renderingOptions={renderingOptions}/>
            })}
        </Layer>
        <Sagas renderingOptions={renderingOptions} model={model}/>
    </Stage>
}

/**
 *
 * @param {DiagramInformation} model
 * @param {number} width
 * @returns {JSX.Element}
 * @constructor
 */
function Sagas({model, renderingOptions}) {
    const sagas = model.sagas.filter(s => s.isValid(model))
    return <Layer>
        {sagas.map((s, sagaIndex) => {

            const sagaX = s.getColumnStart(model)
            const sagaY = 0


            const originContext = model.getContext(s.originContext)
            const originOffsetX = model.getOffsetX(s.originContext)
            const originOffsetY = model.getOffsetY(s.originContext);

            const originCoords = originContext.getAggregatesWithEvent(s.originEvent)
                .map(a => {
                    const commands = a.getCommandsWithEvent(s.originEvent)
                    return commands.map(c => {
                        return [
                            originOffsetX + originContext.getWidthOffset(a.name) + a.getWidthOffsetOfCommand(c.name, originContext) + c.events.indexOf(s.originEvent),
                            originOffsetY + originContext.aggregates.findIndex(a2 => a2.name === a.name) + eventRowStart]
                    })
                }).flat()

            const destinationContext = model.getContext(s.destinationContext)
            const destinationOffsetX = model.getOffsetX(s.destinationContext)
            const destinationCoords = destinationContext.getAggregatesWithCommand(s.destinationCommand).map(a => {
                return [destinationOffsetX + a.getWidthOffsetOfCommand(s.destinationCommand, destinationContext), 1]
            })

            return (
                <Group>
                    <Sticky text={s.name} x={calculateGridX(renderingOptions, sagaX)} y={calculateGridY(sagaY)}
                            renderingOptions={renderingOptions}/>
                    {originCoords.map(([x, y]) => {
                        return <Arrow key={`${x}-${y}`}
                                      stroke={"#FFA85D"}
                                      fill={"#FFA85D"}
                                      points={[
                                          calculateGridX(renderingOptions, x) + 0.5 * renderingOptions.width - 2 * renderingOptions.padding, calculateGridY(y),
                                          calculateGridX(renderingOptions, x) + 0.5 * renderingOptions.width - renderingOptions.padding, calculateGridY(y),
                                          calculateGridX(renderingOptions, sagaX) - 0.5 * renderingOptions.width - renderingOptions.padding, calculateGridY(sagaY),
                                          calculateGridX(renderingOptions, sagaX) - 0.5 * renderingOptions.width - renderingOptions.padding + renderingOptions.padding, calculateGridY(sagaY),
                                      ]}/>
                    })}
                    {destinationCoords.map(([x, y], index) => {
                        const yOfLine = 50 + (10 * (index + originCoords.length + sagaIndex))
                        return <Arrow key={`${x}-${y}`}
                                      stroke={"#A7CDF5"}
                                      fill={"#A7CDF5"}
                                      points={[
                                          calculateGridX(renderingOptions, sagaX) + 0.5 * renderingOptions.width - 2 * renderingOptions.padding, calculateGridY(sagaY),
                                          calculateGridX(renderingOptions, sagaX) + 0.5 * renderingOptions.width - 2 * renderingOptions.padding + 20, calculateGridY(sagaY),
                                          calculateGridX(renderingOptions, sagaX) + 0.5 * renderingOptions.width - 2 * renderingOptions.padding + 20, calculateGridY(sagaY) + yOfLine,
                                          calculateGridX(renderingOptions, x) - renderingOptions.padding, calculateGridY(sagaY) + yOfLine,
                                          calculateGridX(renderingOptions, x) - renderingOptions.padding, calculateGridY(y) - 40,
                                      ]}/>

                    })}
                </Group>
            );
        })}
    </Layer>
}

const rowHeight = 160;
const eventRowStart = 2;
const commandColumnStart = 2;

function calculateGridX(renderingOptions, column) {
    return (column + 0.5) * (renderingOptions.width)
}

function calculateGridY(row) {
    return rowHeight * row + rowHeight * 0.5
}

/**
 *
 * @param {DiagramInformation} model
 * @param {DiagramContext} context
 * @returns {JSX.Element}
 * @constructor
 */
function ContextEntities({model, context, renderingOptions}) {
    return <Group>
        {context.aggregates.map((a, index) => {
            const heightOffset = model.getOffsetY(context.name);
            return <Group key={a.name}>
                <Sticky color={"#f6D644"}
                        text={a.name}
                        renderingOptions={renderingOptions}
                        x={calculateGridX(renderingOptions, 0)}
                        y={calculateGridY(heightOffset + commandColumnStart + index)}/>
            </Group>
        })}
    </Group>
}

/**
 *
 * @param {DiagramInformation} model
 * @param {DiagramContext} context
 * @returns {JSX.Element}
 * @constructor
 */
function Context({model, context, renderingOptions}) {
    const modelWidthOffset = model.getOffsetX(context.name)
    return <Group>
        {context.aggregates.map((a, aggIndex) => {
            const heightOffset = model.getOffsetY(context.name);
            const widthOffset = modelWidthOffset + context.getWidthOffset(a.name)
            return <Group key={a.name}>
                {a.commands.map((c) => {
                    const commandOffset = a.getWidthOffsetOfCommand(c.name, context)
                    const views = a.getCommand(c.name).getViews(context)
                    const commandX = calculateGridX(renderingOptions, widthOffset + commandOffset);
                    const commandY = calculateGridY(1);

                    const viewDefinitions = views.map((v, index) => {
                        const viewX = calculateGridX(renderingOptions, widthOffset + index + commandOffset + 1);
                        const viewY = calculateGridY(1);
                        return {viewX, viewY, v}
                    });

                    const eventDefinition = c.events.map((e, index) => {
                        const eventX = calculateGridX(renderingOptions, widthOffset + index + commandOffset);
                        const eventY = calculateGridY(heightOffset + eventRowStart + aggIndex);
                        return {eventX, eventY, e}
                    })

                    return <Group key={c.name}>

                        {eventDefinition.map((event) => {
                            const viewArrows = viewDefinitions.filter(v => v.v.events.includes(event.e))
                            return <Group key={event.event}>
                                <Arrow
                                    stroke={"#A7CDF5"}
                                    fill={"#A7CDF5"}
                                    points={[
                                        commandX - renderingOptions.padding, commandY + 38,
                                        commandX - renderingOptions.padding, commandY + 78,
                                        event.eventX - renderingOptions.padding, commandY + 88,
                                        event.eventX - renderingOptions.padding, event.eventY - 38,
                                    ]}/>

                                {viewArrows.map(va => {
                                    return <Arrow
                                        key={va.v}
                                        stroke={"#FFA85D"}
                                        fill={"#FFA85D"}
                                        tension={0}
                                        points={[
                                            event.eventX + 0.5 * renderingOptions.width - renderingOptions.padding * 2, event.eventY,
                                            event.eventX + 0.5 * renderingOptions.width - renderingOptions.padding, event.eventY,
                                            event.eventX + 0.5 * renderingOptions.width - renderingOptions.padding, va.viewY + 68,
                                            va.viewX - renderingOptions.padding, va.viewY + 68,
                                            va.viewX - renderingOptions.padding, va.viewY + 38,
                                        ]}/>
                                })}
                                <Sticky
                                    color={"#FFA85D"}
                                    renderingOptions={renderingOptions}
                                    x={event.eventX}
                                    y={event.eventY} text={event.e}/>
                            </Group>
                        })}


                        {viewDefinitions.map((v) => {
                            return <Sticky color={"#A1D786"} key={v.name} text={v.v.name} x={v.viewX} y={v.viewY}
                                           renderingOptions={renderingOptions}/>
                        })}
                        <Sticky color={"#A7CDF5"}
                                renderingOptions={renderingOptions}
                                x={commandX}
                                y={commandY}
                                text={c.name}/>
                    </Group>
                })}
            </Group>
        })}
    </Group>
}

export default App;
