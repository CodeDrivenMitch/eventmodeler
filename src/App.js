import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Col, Container, Form, Navbar, NavbarBrand, Row} from "react-bootstrap";
import {useEffect, useRef, useState} from "react";
import {Arrow, Group, Layer, Rect, Stage, Text} from "react-konva";
import {defaultValue} from './defaultvalue'
import {parse} from './parser'

function App() {
    const [value, setValue] = useState(defaultValue)
    const model = parse(value);
    return (
        <div className="App">
            <Container fluid>
                <Navbar>
                    <NavbarBrand><img height={40} src={"/axon_icon.svg"}/> Eventmodeler.org</NavbarBrand>
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
                    <Col md={"8"}>
                        <div style={{height: "75vh", overflowX: "scroll", textAlign: "left"}}>
                            <DiagramRendered model={model}/>
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

function Sticky({text, color, x, y, width = 200, height = 76, fontSize = 18}) {
    const rectRef = useRef()
    const [offset, setOffset] = useState(-1)
    useEffect(() => {
        setOffset(width / 2 - (parseInt(rectRef.current?.textWidth, 10) / 2))
    }, [rectRef.current, rectRef.current?.textWidth]);

    return <Group x={x - width / 2} y={y - height / 2}>
        <Rect width={width} height={height} fill={color} stroke="black" strokeWidth={3}/>
        <Text ref={rectRef} width={width - 10} padding={10} x={offset} y={height / 2 - fontSize / 2 - 10}
              text={text} ellipsis={true} wrap={'none'} fontSize={fontSize}/>
    </Group>
}

/**
 *
 * @param {DiagramInformation} model
 * @returns {JSX.Element}
 * @constructor
 */
function DiagramRendered({model}) {
    return <Stage height={0.73 * window.innerHeight} width={10000}>
        <Layer>
            {model.contexts.map(c => {
                return <Context key={c.name} model={model} context={c}/>
            })}
        </Layer>
    </Stage>

}

const columnWidth = 250;
const rowHeight = 160;
const padding = 50;
const eventRowStart = 2;
const entityColumn = -1
const commandColumnStart = 2;

function calculateGridX(column) {
    return padding + columnWidth + column * columnWidth + columnWidth * 0.5
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
function Context({model, context}) {
    const modelWidthOffset = model.getWidthOffset(context.name)
    return <Group>
        {context.aggregates.map((a, index) => {
            const heightOffset = model.getHeightOffset(context.name);
            const widthOffset = modelWidthOffset + context.getWidthOffset(a.name)
            return <Group key={a.name}>
                <Sticky color={"#4ac21c"}
                        text={a.name}
                        x={calculateGridX(entityColumn)}
                        y={calculateGridY(heightOffset + commandColumnStart)}/>

                {a.commands.map((c, cIndex) => {
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
                        const eventY = calculateGridY(heightOffset + eventRowStart);
                        return {eventX, eventY, e}
                    })

                    return <Group key={c.name}>
                        <Sticky color={"#05dde5"}
                                x={commandX}
                                y={commandY}
                                text={c.name}/>

                        {eventDefinition.map((event) => {
                            const viewArrows = viewDefinitions.filter(v => v.v.events.includes(event.e))
                            console.log(viewArrows)
                            return <Group key={event.event}>
                                <Sticky
                                    color={"orange"}
                                    x={event.eventX}
                                    y={event.eventY} text={event.e}/>
                                <Arrow
                                    stroke={"black"}
                                    fill={"black"}
                                    points={[commandX, commandY + 38, event.eventX, event.eventY - 38]}/>

                                {viewArrows.map(va => {
                                    return <Arrow
                                        key={va.v}
                                        stroke={"black"}
                                        fill={"black"}
                                        points={[event.eventX + 100, event.eventY, va.viewX, va.viewY + 38]}/>
                                })}
                            </Group>
                        })}


                        {viewDefinitions.map((v) => {
                            return <Sticky color={"green"} key={v.name} text={v.v.name} x={v.viewX} y={v.viewY}/>
                        })}
                    </Group>
                })}
            </Group>
        })}
    </Group>
}

export default App;
