import {render} from "@testing-library/react";
import _ from "lodash";
import {renderVex} from "@/lib/vexRenderer";

describe('the vex renderer', () => {
  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {})
  })

  it('should render', () => {
    const renderElementId = _.uniqueId('vexRendererTest')
    render(<div id={renderElementId}/>)

    expect(() => renderVex({trebleVoice: 'C4/w'})).not.toThrow()
    expect(() => renderVex({bassVoice: 'C3/w'})).not.toThrow()
  })

  it.skip('should render voices', () => {

  })

  it.skip('should render multiple voices', () => {

  })

  it.skip('should render when there are different amounts of treble and bass voices', () => {

  })
})
