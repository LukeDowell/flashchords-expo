import React from "react";
import { SVGContext } from "vexflow";
import Svg, { Text, Path, Rect, G } from "react-native-svg";

const propMap = {
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  class: "className",
};

abstract class ContextElement {
  children: any[]
  props: any

  constructor(props: any) {
    this.children = [];
    this.props = { style: {}, key: 0, ...props };
  }

  get style() {
    return this.props.style;
  }

  applyProps(attributes: any) {
    this.props = { ...this.props, ...attributes };
  }

  setAttribute(propertyName: string, value: any) {
    if (propertyName === "class") propertyName = "className";

    this.props[propertyName] = value;
  }

  appendChild(elem: any) {
    this.children.push(elem);
  }

  _doPropsAdjustment() {
    Object.entries(propMap).forEach(([key, value]) => {
      this.props[value] = this.props[key];
      delete this.props[key];
    });
  }

  abstract toReactElement(): any
}

class DivContextElement extends ContextElement {
  constructor(props?: any) {
    super({ ...props, svgElementType: "div" });
  }

  toReactElement() {
    this._doPropsAdjustment()
    const childrenReactElements = this.children.map((child) =>
      child.toReactElement()
    );

    return React.createElement("div", this.props, childrenReactElements);
  }
}

class SVGContextElement extends ContextElement {
  constructor(props?: any) {
    super({
      ...props,
      xmlns: "http://www.w3.org/2000/svg",
      svgElementType: "svg",
    });
  }

  toReactElement() {
    this._doPropsAdjustment()
    const childrenReactElements = this.children.map((child) =>
      child.toReactElement()
    );

    return React.createElement(Svg, this.props as unknown as any, childrenReactElements);
  }
}

class PathContextElement extends ContextElement {
  constructor(props?: any) {
    super({ ...props, svgElementType: "path" });
  }

  toReactElement() {
    this._doPropsAdjustment()
    const childrenReactElements = this.children.map((child) =>
      child.toReactElement()
    );

    delete this.props["x"];
    delete this.props["y"];

    return React.createElement(Path, this.props, childrenReactElements);
  }
}

class RectContextElement extends ContextElement {
  constructor(props?: any) {
    super({ ...props, svgElementType: "rect" });
  }

  toReactElement() {
    this._doPropsAdjustment()
    const childrenReactElements = this.children.map((child) =>
      child.toReactElement()
    );

    return React.createElement(Rect, this.props, childrenReactElements);
  }
}

class GContextElement extends ContextElement {
  constructor(props?: any) {
    super({ ...props, svgElementType: "g" });
  }

  toReactElement() {
    this._doPropsAdjustment()
    const childrenReactElements = this.children.map((child) =>
      child.toReactElement()
    );

    return React.createElement(G, this.props, childrenReactElements);
  }
}

class TextContextElement extends ContextElement {
  constructor(props?: any) {
    super({ ...props, svgElementType: "text" });
  }

  toReactElement() {
    this._doPropsAdjustment()
    return React.createElement(Text, this.props, this.textContent);
  }
}

type SvgTypes = 'svg' | 'rect' | 'path' | 'g' | 'text'
// hmm what am i actually supposed to do here?
type CringeSubclasses = typeof SVGContextElement | typeof RectContextElement | typeof PathContextElement | typeof GContextElement | typeof TextContextElement
const contextClasses: Record<SvgTypes, CringeSubclasses> = {
  svg: SVGContextElement,
  rect: RectContextElement,
  path: PathContextElement,
  g: GContextElement,
  text: TextContextElement,
};

class RNVexFlowSVGContext extends SVGContext {
  nextElementKey: number

  constructor(width: number, height: number) {
    super(new DivContextElement() as unknown as HTMLElement);

    this.svg.applyProps({
      width: width ? width : 250,
      height: height ? height : 250,
    });
    this.nextElementKey = 1;
  }

  create(svgElementType: string): any {
    const scopedType = svgElementType as SvgTypes
    const key = this.nextElementKey ? this.nextElementKey++ : 0;

    return new contextClasses[scopedType]({ key: key });
  }

  /**
   * Overriden so that functions inherited from SVGContext can use it.
   * @param element  Element to add attributes to.
   * @param attributes   Desired attributes.
   */
  applyAttributes(element: any, attributes: any): any {
    element.applyProps(attributes);
  }

  add(element: any): any {
    this.parent.children.push(element);
  }

  clear() {
    this.svg.children = [];
  }

  render() {
    return this.svg.toReactElement();
  }
}

export default RNVexFlowSVGContext;
