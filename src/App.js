import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Navbar, NavbarBrand, Row} from "react-bootstrap";
import {useState} from "react";
import {Arrow, Group, Layer, Rect, Stage, Text} from "react-konva";
import {defaultValue} from './defaultvalue'
import {parse} from './parser'

function App() {
    const [value, setValue] = useState(defaultValue)
    const model = parse(value);
    console.log(JSON.stringify(model, null, 4))
    return (
        <div className="App">
            <Container fluid>
                <Navbar>
                    <NavbarBrand><img alt={"Axon Logo"} height={40}
                                      src={"/axon_icon.svg"}/> Eventmodeler.org</NavbarBrand>
                    <Navbar.Text style={{float: 'right'}}>Brough to you by Axon Framework</Navbar.Text>
                </Navbar>
                <Row>
                    <Col style={{"textAlign": "left"}}>
                        <p>Welcome to the Axon Framework event modeler. You can define your input on the left, which
                            will be translated in a diagram on the right. The diagram will be updated automatically.</p>
                    </Col>
                </Row>
                <Row>
                    <Col md={3} style={{"textAlign": "left"}}>
                    <textarea style={{"width": "20vw", "height": "75vh", "fontSize": 14}} value={value}
                              onChange={(e) => setValue(e.target.value)}>
                    </textarea>

                        {/*<h5>Visualisation options</h5>*/}
                        {/*<Form.Check type="checkbox" id={`views`} label={`Show views`} value={'checked'}/>*/}
                        {/*<Form.Check type="checkbox" id={`inventory`} label={`Show Inventory context`}*/}
                        {/*            value={'checked'}/>*/}
                        {/*<Form.Check type="checkbox" id={`booking`} label={`Show Booking context`} value={'checked'}/>*/}
                    </Col>
                    <Col md={9}>
                        <div style={{height: "75vh", overflowX: "scroll", display: 'flex'}}>
                            <DiagramRendered model={model}/>
                            <DiagramEntities model={model}/>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>This event modeling tool was brought to you by AxonIQ, creators of Axon framework. </Col>
                </Row>

            </Container>
        </div>
    );
}

function Sticky({text, color, x, y, width = 220, height = 76, fontSize = 14, padding = 10}) {
    const textWidth = width - padding * 2

    return <Group x={x - width / 2} y={y - height / 2}>
        <Rect width={width}
              height={height}
              fill={color}
              stroke="black"
              strokeWidth={1}
        />
        <Text width={textWidth}
              x={padding}
              y={height / 2 - fontSize / 1.8}
              align={"center"}
              lineHeight={1.3}
              text={text} fontSize={fontSize}
        />
    </Group>
}


/**
 *
 * @param {DiagramInformation} model
 * @returns {JSX.Element}
 * @constructor
 */
function DiagramEntities({model}) {
    return <Stage height={0.73 * window.innerHeight} width={columnWidth + padding}
                  style={{position: 'absolute', backgroundColor: 'white'}}>
        <Layer>
            {model.contexts.map(c => {
                return <ContextEntities key={c.name} model={model} context={c}/>
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
function DiagramRendered({model}) {
    return <Stage height={0.73 * window.innerHeight} width={10000} style={{float: 'left', marginLeft: columnWidth}}>
        <Layer>
            {model.contexts.map(c => {
                return <Context key={c.name} model={model} context={c}/>
            })}
        </Layer>
        <Sagas model={model}/>
    </Stage>
}

/**
 *
 * @param {DiagramInformation} model
 * @returns {JSX.Element}
 * @constructor
 */
function Sagas({model}) {
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
                            originOffsetX + a.getWidthOffsetOfCommand(c.name, originContext) + c.events.indexOf(s.originEvent),
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
                    <Sticky text={s.name} x={calculateGridX(sagaX)} y={calculateGridY(sagaY)}/>
                    {originCoords.map(([x, y]) => {
                        return <Arrow key={`${x}-${y}`}
                                      stroke={"#FFA85D"}
                                      fill={"#FFA85D"}
                                      points={[
                                          calculateGridX(x) + 100, calculateGridY(y),
                                          calculateGridX(x) + 120, calculateGridY(y),
                                          calculateGridX(sagaX) - 130, calculateGridY(sagaY),
                                          calculateGridX(sagaX) - 110, calculateGridY(sagaY),
                                      ]}/>
                    })}
                    {destinationCoords.map(([x, y], index) => {
                        const yOfLine = 50 + (10 * (index + originCoords.length + sagaIndex))
                        return <Arrow key={`${x}-${y}`}
                                      stroke={"#A7CDF5"}
                                      fill={"#A7CDF5"}
                                      points={[
                                          calculateGridX(sagaX) + 110, calculateGridY(sagaY),
                                          calculateGridX(sagaX) + 130, calculateGridY(sagaY),
                                          calculateGridX(sagaX) + 130, calculateGridY(sagaY) + yOfLine,
                                          calculateGridX(x), calculateGridY(sagaY) + yOfLine,
                                          calculateGridX(x), calculateGridY(y) - 40,
                                      ]}/>

                    })}
                </Group>
            );
        })}
    </Layer>
}

const columnWidth = 250;
const rowHeight = 160;
const padding = 50;
const eventRowStart = 2;
const commandColumnStart = 2;

function calculateGridX(column) {
    return padding + column * columnWidth + columnWidth * 0.5
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
function ContextEntities({model, context}) {
    return <Group>
        {context.aggregates.map((a, index) => {
            const heightOffset = model.getOffsetY(context.name);
            return <Group key={a.name}>
                <Sticky color={"#f6D644"}
                        text={a.name}
                        x={calculateGridX(0)}
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
function Context({model, context}) {
    const modelWidthOffset = model.getOffsetX(context.name)
    return <Group>
        {context.aggregates.map((a, aggIndex) => {
            const heightOffset = model.getOffsetY(context.name);
            const widthOffset = modelWidthOffset + context.getWidthOffset(a.name)
            return <Group key={a.name}>
                {a.commands.map((c) => {
                    const commandOffset = a.getWidthOffsetOfCommand(c.name, context)
                    const views = a.getCommand(c.name).getViews(context)
                    const commandX = calculateGridX(widthOffset + commandOffset);
                    const commandY = calculateGridY(1);

                    const viewDefinitions = views.map((v, index) => {
                        const viewX = calculateGridX(widthOffset + index + commandOffset + 1);
                        const viewY = calculateGridY(1);
                        return {viewX, viewY, v}
                    });

                    const eventDefinition = c.events.map((e, index) => {
                        const eventX = calculateGridX(widthOffset + index + commandOffset);
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
                                        commandX, commandY + 38,
                                        commandX, commandY + 78,
                                        event.eventX, commandY + 88,
                                        event.eventX, event.eventY - 38,
                                    ]}/>

                                {viewArrows.map(va => {
                                    return <Arrow
                                        key={va.v}
                                        stroke={"#FFA85D"}
                                        fill={"#FFA85D"}
                                        tension={0}
                                        points={[
                                            event.eventX + 100, event.eventY,
                                            event.eventX + 120, event.eventY,
                                            event.eventX + 120, va.viewY + 68,
                                            va.viewX, va.viewY + 68,
                                            va.viewX, va.viewY + 38,
                                        ]}/>
                                })}
                                <Sticky
                                    color={"#FFA85D"}
                                    x={event.eventX}
                                    y={event.eventY} text={event.e}/>
                            </Group>
                        })}


                        {viewDefinitions.map((v) => {
                            return <Sticky color={"#A1D786"} key={v.name} text={v.v.name} x={v.viewX} y={v.viewY}/>
                        })}
                        <Sticky color={"#A7CDF5"}
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
