import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import {Col, Container, Navbar, NavbarBrand, Row} from "react-bootstrap";
import {useState} from "react";
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

                        <SplitPane minSize={100} allowResize={true} primary={"first"} split={"vertical"}
                                   defaultSize={400}>
                            <div style={{paddingTop: 30}}>
                                <RangeSlider
                                    tooltipLabel={(n) => `Sticky width: ${n}px`}
                                    value={width}
                                    max={300}
                                    min={50}
                                    tooltip={"on"}
                                    tooltipPlacement={"top"}
                                    onChange={changeEvent => setWidth(parseInt(changeEvent.target.value))}
                                />
                                <RangeSlider
                                    tooltipLabel={(n) => `Padding: ${n}px`}
                                    value={padding}
                                    max={50}
                                    min={2}
                                    tooltip={"on"}
                                    tooltipPlacement={"top"}
                                    onChange={changeEvent => setPadding(parseInt(changeEvent.target.value))}
                                />

                                <RangeSlider
                                    tooltipLabel={(n) => `Font size: ${n}px`}
                                    value={fontSize}
                                    max={50}
                                    min={2}
                                    tooltip={"on"}
                                    tooltipPlacement={"top"}
                                    onChange={changeEvent => setFontSize(parseInt(changeEvent.target.value))}
                                />
                                <textarea
                                    style={{"width": "98%", "height": "75vh", "fontSize": 14, marginRight: '100px'}}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}/>
                            </div>
                            <div>
                                <div style={{height: "75vh", overflowX: "scroll", display: 'flex'}}>
                                    <DiagramRendered renderingOptions={renderingOptions} model={model}/>
                                    <DiagramEntities renderingOptions={renderingOptions} model={model}/>
                                </div>
                            </div>
                        </SplitPane>
                    </Col>
                </Row>
                <Row>
                    <Col>This event modeling tool was brought to you by AxonIQ, creators of Axon framework. </Col>
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
              y={height / 2 - fontSize }
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
    return <Stage height={0.73 * window.innerHeight} width={renderingOptions.width + renderingOptions.padding}
                  style={{position: 'absolute', backgroundColor: 'white'}}>
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
    return <Stage height={0.73 * window.innerHeight} width={(model.getWidth() + 2) * renderingOptions.width}
                  style={{float: 'left', marginLeft: renderingOptions.width + renderingOptions.padding}}>
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

const columnWidth = 250;
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
